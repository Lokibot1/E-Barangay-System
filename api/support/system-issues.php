<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storageDir = __DIR__ . '/storage';
$storagePath = $storageDir . '/system-issues.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0777, true);
}

$readPayload = function () {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
};

$loadIssues = function () use ($storagePath) {
    if (!file_exists($storagePath)) {
        return [];
    }

    $raw = file_get_contents($storagePath);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
};

$saveIssues = function ($items) use ($storagePath) {
    file_put_contents(
        $storagePath,
        json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
};

$normalizeStatus = function ($status) {
    $status = strtolower(trim((string)$status));
    $allowed = ['open', 'in_review', 'resolved'];
    return in_array($status, $allowed, true) ? $status : '';
};

$normalizeSeverity = function ($severity) {
    $severity = strtolower(trim((string)$severity));
    $allowed = ['low', 'medium', 'high', 'critical'];
    return in_array($severity, $allowed, true) ? $severity : 'medium';
};

$sanitizeAttachment = function ($attachment) {
    if (!is_array($attachment)) {
        return null;
    }

    $name = trim((string)($attachment['name'] ?? ''));
    $type = trim((string)($attachment['type'] ?? ''));
    $size = (int)($attachment['size'] ?? 0);
    $dataUrl = trim((string)($attachment['data_url'] ?? ''));
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if ($name === '' || $dataUrl === '' || !in_array($type, $allowedTypes, true)) {
        return null;
    }

    if ($size <= 0 || $size > 2097152) {
        return null;
    }

    return [
        'name' => $name,
        'type' => $type,
        'size' => $size,
        'data_url' => $dataUrl,
    ];
};

$readQueryValue = function ($key, $payload = null) {
    if (is_array($payload) && array_key_exists($key, $payload)) {
        $value = $payload[$key];
        return ($value === '' || $value === null) ? null : $value;
    }

    if (isset($_GET[$key])) {
        $value = $_GET[$key];
        return ($value === '' || $value === null) ? null : $value;
    }

    return null;
};

$matchesFilter = function ($item, $userId, $reporterEmail, $status) {
    if ($userId !== null && (string)($item['user_id'] ?? '') !== (string)$userId) {
        return false;
    }

    if ($reporterEmail !== null && strcasecmp((string)($item['reporter_email'] ?? ''), (string)$reporterEmail) !== 0) {
        return false;
    }

    if ($status !== '' && (string)($item['status'] ?? 'open') !== $status) {
        return false;
    }

    return true;
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $status = $normalizeStatus($_GET['status'] ?? '');
    $userId = $readQueryValue('user_id');
    $reporterEmail = $readQueryValue('reporter_email');
    $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 50;

    $items = $loadIssues();
    $filtered = array_values(array_filter($items, function ($item) use ($userId, $reporterEmail, $status, $matchesFilter) {
        return $matchesFilter($item, $userId, $reporterEmail, $status);
    }));

    usort($filtered, function ($a, $b) {
        $aTime = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $bTime = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $bTime <=> $aTime;
    });

    $paged = array_slice($filtered, 0, $limit);

    echo json_encode([
        'data' => $paged,
        'meta' => [
            'current_page' => 1,
            'per_page' => $limit,
            'total' => count($filtered),
        ],
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = $readPayload();

    $userId = $readQueryValue('user_id', $payload);
    $reporterName = trim((string)($payload['reporter_name'] ?? 'Resident'));
    $reporterEmail = trim((string)($payload['reporter_email'] ?? ''));
    $userRole = trim((string)($payload['user_role'] ?? 'resident'));
    $category = trim((string)($payload['category'] ?? 'General Assistance'));
    $severity = $normalizeSeverity($payload['severity'] ?? 'medium');
    $subject = trim((string)($payload['subject'] ?? ''));
    $description = trim((string)($payload['description'] ?? ''));
    $steps = trim((string)($payload['steps_to_reproduce'] ?? ''));
    $affectedPage = trim((string)($payload['affected_page'] ?? ''));
    $reportedFromPath = trim((string)($payload['reported_from_path'] ?? ''));
    $browserInfo = trim((string)($payload['browser_info'] ?? ''));
    $attachment = $sanitizeAttachment($payload['attachment'] ?? null);

    if (array_key_exists('attachment', $payload) && $payload['attachment'] !== null && $attachment === null) {
        http_response_code(422);
        echo json_encode(['message' => 'Attached image must be a JPG, PNG, or WEBP file up to 2 MB.']);
        exit;
    }

    if ($subject === '') {
        http_response_code(422);
        echo json_encode(['message' => 'Issue subject is required.']);
        exit;
    }

    if ($description === '') {
        http_response_code(422);
        echo json_encode(['message' => 'Issue description is required.']);
        exit;
    }

    $items = $loadIssues();
    $nextId = 1;

    foreach ($items as $item) {
        if (isset($item['id']) && is_numeric($item['id'])) {
            $nextId = max($nextId, (int)$item['id'] + 1);
        }
    }

    $timestamp = date('c');
    $record = [
        'id' => $nextId,
        'user_id' => $userId,
        'reporter_name' => $reporterName !== '' ? $reporterName : 'Resident',
        'reporter_email' => $reporterEmail,
        'user_role' => $userRole,
        'category' => $category,
        'severity' => $severity,
        'subject' => $subject,
        'description' => $description,
        'steps_to_reproduce' => $steps,
        'affected_page' => $affectedPage,
        'reported_from_path' => $reportedFromPath,
        'browser_info' => $browserInfo,
        'attachment' => $attachment,
        'status' => 'open',
        'created_at' => $timestamp,
        'updated_at' => $timestamp,
    ];

    $items[] = $record;
    $saveIssues($items);

    echo json_encode($record);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $payload = $readPayload();
    $issueId = isset($_GET['id']) ? (int)$_GET['id'] : (int)($payload['id'] ?? 0);
    $status = $normalizeStatus($payload['status'] ?? '');

    if ($issueId <= 0) {
        http_response_code(422);
        echo json_encode(['message' => 'Issue ID is required.']);
        exit;
    }

    if ($status === '') {
        http_response_code(422);
        echo json_encode(['message' => 'A valid issue status is required.']);
        exit;
    }

    $items = $loadIssues();
    $updatedIssue = null;

    foreach ($items as &$item) {
        if ((int)($item['id'] ?? 0) !== $issueId) {
            continue;
        }

        $item['status'] = $status;
        $item['updated_at'] = date('c');
        $updatedIssue = $item;
        break;
    }
    unset($item);

    if ($updatedIssue === null) {
        http_response_code(404);
        echo json_encode(['message' => 'Issue report not found.']);
        exit;
    }

    $saveIssues($items);
    echo json_encode($updatedIssue);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
