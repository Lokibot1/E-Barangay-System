<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$storageDir = __DIR__ . '/../notifications/storage';
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
    return 'user';
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

$payload = $readPayload();
$appointmentId = $payload['appointment_id'] ?? ($_GET['appointment_id'] ?? null);

if ($appointmentId === null || $appointmentId === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Appointment ID is required.']);
    exit;
}

$scope = $normalizeScope($payload['scope'] ?? 'user');
$userId = $resolveUserId($payload);
$message = trim((string)($payload['message'] ?? ''));
if ($message === '') {
    $message = "Appointment #{$appointmentId} has been rescheduled.";
}

$data = isset($payload['data']) && is_array($payload['data']) ? $payload['data'] : [];
$data['appointment_id'] = $appointmentId;

$externalId = isset($payload['external_id']) ? trim((string)$payload['external_id']) : '';
if ($externalId === '') {
    $externalId = "appointment-reschedule-{$appointmentId}";
}

$items = $loadNotifications();
$nextId = 1;
foreach ($items as $item) {
    if (isset($item['id']) && is_numeric($item['id'])) {
        $nextId = max($nextId, (int)$item['id'] + 1);
    }
}

$record = [
    'id' => $nextId,
    'external_id' => $externalId,
    'scope' => $scope,
    'user_id' => $userId,
    'type' => 'appointment_scheduled',
    'message' => $message,
    'data' => $data,
    'source' => 'appointment',
    'is_read' => false,
    'created_at' => date('c'),
];

$items[] = $record;
$saveNotifications($items);

echo json_encode($record);
