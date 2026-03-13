<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storageDir = __DIR__ . '/storage';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0777, true);
}

$getIdentifier = function ($input) {
    if (is_array($input) && isset($input['identifier'])) {
        return trim((string)$input['identifier']);
    }
    if (isset($_GET['identifier'])) {
        return trim((string)$_GET['identifier']);
    }
    return '';
};

$readPayload = function () {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
};

$buildPath = function ($identifier) use ($storageDir) {
    $hash = sha1($identifier);
    return $storageDir . '/' . $hash . '.json';
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $identifier = $getIdentifier([]);
    if ($identifier === '') {
        http_response_code(422);
        echo json_encode(['message' => 'Identifier is required.']);
        exit;
    }

    $path = $buildPath($identifier);
    if (!file_exists($path)) {
        echo json_encode(['dataUrl' => '']);
        exit;
    }

    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    echo json_encode([
        'dataUrl' => $data['dataUrl'] ?? '',
        'updatedAt' => $data['updatedAt'] ?? null,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $payload = $readPayload();
    $identifier = $getIdentifier($payload);
    if ($identifier === '') {
        http_response_code(422);
        echo json_encode(['message' => 'Identifier is required.']);
        exit;
    }
    $path = $buildPath($identifier);
    if (file_exists($path)) {
        unlink($path);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$payload = $readPayload();
$identifier = $getIdentifier($payload);
$dataUrl = isset($payload['dataUrl']) ? trim((string)$payload['dataUrl']) : '';

if ($identifier === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Identifier is required.']);
    exit;
}

if ($dataUrl === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Profile photo data is required.']);
    exit;
}

if (strpos($dataUrl, 'data:image/') !== 0) {
    http_response_code(422);
    echo json_encode(['message' => 'Invalid image format.']);
    exit;
}

$record = [
    'identifier' => $identifier,
    'dataUrl' => $dataUrl,
    'updatedAt' => date('c'),
];

$path = $buildPath($identifier);
file_put_contents($path, json_encode($record));

echo json_encode(['dataUrl' => $dataUrl]);
