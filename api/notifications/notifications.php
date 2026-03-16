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
$storagePath = $storageDir . '/notifications.json';

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

$loadNotifications = function () use ($storagePath) {
    if (!file_exists($storagePath)) {
        return [];
    }
    $raw = file_get_contents($storagePath);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
};

$saveNotifications = function ($items) use ($storagePath) {
    file_put_contents($storagePath, json_encode(array_values($items)));
};

$normalizeScope = function ($scope) {
    $scope = strtolower(trim((string)$scope));
    if ($scope === 'admin') return 'admin';
    if ($scope === 'user') return 'user';
    return '';
};

$resolveUserId = function ($input) {
    if (is_array($input) && array_key_exists('user_id', $input)) {
        $value = $input['user_id'];
        if ($value === '' || $value === null) return null;
        return $value;
    }
    if (isset($_GET['user_id'])) {
        $value = $_GET['user_id'];
        if ($value === '' || $value === null) return null;
        return $value;
    }
    return null;
};

$matchesFilter = function ($item, $scope, $userId) {
    if ($scope !== '') {
        $itemScope = isset($item['scope']) ? $item['scope'] : 'user';
        if ($itemScope !== $scope) return false;
    }
    if ($userId !== null) {
        $itemUser = $item['user_id'] ?? null;
        return (string)$itemUser === (string)$userId;
    }
    return true;
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $perPage = isset($_GET['per_page']) ? max(1, (int)$_GET['per_page']) : 50;
    $scope = $normalizeScope($_GET['scope'] ?? '');
    $userId = $resolveUserId($_GET);

    $items = $loadNotifications();
    $filtered = array_values(array_filter($items, function ($item) use ($scope, $userId, $matchesFilter) {
        return $matchesFilter($item, $scope, $userId);
    }));

    usort($filtered, function ($a, $b) {
        $aTime = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $bTime = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $bTime <=> $aTime;
    });

    $paged = array_slice($filtered, 0, $perPage);
    echo json_encode([
        'data' => $paged,
        'meta' => [
            'current_page' => 1,
            'per_page' => $perPage,
            'total' => count($filtered),
        ],
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = $readPayload();

    $type = trim((string)($payload['type'] ?? ''));
    $message = trim((string)($payload['message'] ?? ''));
    $scope = $normalizeScope($payload['scope'] ?? '');
    $userId = $resolveUserId($payload);
    $externalId = isset($payload['external_id']) ? trim((string)$payload['external_id']) : '';
    $data = isset($payload['data']) && is_array($payload['data']) ? $payload['data'] : [];
    $source = isset($payload['source']) ? trim((string)$payload['source']) : '';
    $createdAt = $payload['created_at'] ?? date('c');
    $isRead = isset($payload['is_read']) ? (bool)$payload['is_read'] : false;

    if ($type === '') {
        http_response_code(422);
        echo json_encode(['message' => 'Notification type is required.']);
        exit;
    }

    if ($message === '') {
        $message = $type;
    }

    if ($scope === '') {
        $scope = 'user';
    }

    $items = $loadNotifications();

    if ($externalId !== '') {
        foreach ($items as $item) {
            if (($item['external_id'] ?? '') === $externalId
                && ($item['scope'] ?? 'user') === $scope
                && ((string)($item['user_id'] ?? '') === (string)$userId)) {
                echo json_encode($item);
                exit;
            }
        }
    }

    $nextId = 1;
    foreach ($items as $item) {
        if (isset($item['id']) && is_numeric($item['id'])) {
            $nextId = max($nextId, (int)$item['id'] + 1);
        }
    }

    $record = [
        'id' => $nextId,
        'external_id' => $externalId !== '' ? $externalId : null,
        'scope' => $scope,
        'user_id' => $userId,
        'type' => $type,
        'message' => $message,
        'data' => $data,
        'source' => $source,
        'is_read' => $isRead,
        'created_at' => $createdAt,
    ];

    $items[] = $record;
    $saveNotifications($items);

    echo json_encode($record);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $payload = $readPayload();
    $markAll = !empty($payload['mark_all']);
    $read = isset($payload['read']) ? (bool)$payload['read'] : true;
    $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
    $externalIds = isset($payload['external_ids']) && is_array($payload['external_ids']) ? $payload['external_ids'] : [];
    $scope = $normalizeScope($payload['scope'] ?? ($_GET['scope'] ?? ''));
    $userId = $resolveUserId($payload);
    if ($userId === null) {
        $userId = $resolveUserId($_GET);
    }

    $items = $loadNotifications();
    $updated = [];

    foreach ($items as &$item) {
        if (!$matchesFilter($item, $scope, $userId)) {
            continue;
        }
        $matchId = isset($item['id']) && in_array($item['id'], $ids);
        $matchExternal = ($item['external_id'] ?? '') !== '' && in_array($item['external_id'], $externalIds);
        if ($markAll || $matchId || $matchExternal) {
            $item['is_read'] = $read;
            $updated[] = $item['id'];
        }
    }
    unset($item);

    $saveNotifications($items);

    echo json_encode(['success' => true, 'updated' => $updated]);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
