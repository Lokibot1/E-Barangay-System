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
$jsonPath = $storageDir . '/logo.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($jsonPath)) {
        echo json_encode(['dataUrl' => '']);
        exit;
    }

    $raw = file_get_contents($jsonPath);
    $data = json_decode($raw, true);
    echo json_encode([
        'dataUrl' => $data['dataUrl'] ?? '',
        'updatedAt' => $data['updatedAt'] ?? null,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (file_exists($jsonPath)) {
        unlink($jsonPath);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
$dataUrl = isset($payload['dataUrl']) ? trim((string)$payload['dataUrl']) : '';

if ($dataUrl === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Logo data is required.']);
    exit;
}

if (strpos($dataUrl, 'data:image/') !== 0) {
    http_response_code(422);
    echo json_encode(['message' => 'Invalid image format.']);
    exit;
}

$record = [
    'dataUrl' => $dataUrl,
    'updatedAt' => date('c'),
];

file_put_contents($jsonPath, json_encode($record));

echo json_encode(['dataUrl' => $dataUrl]);
