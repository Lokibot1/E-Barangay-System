<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storageDir = __DIR__ . '/storage';
$storagePath = $storageDir . '/verification-admin-logs.json';
$allowedActions = ['approved', 'rejected', 'visit_set'];

function ensureDirectory(string $path): void
{
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }
}

function sendJson(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function readRecords(string $path): array
{
    if (!file_exists($path)) {
        return [];
    }

    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function writeRecords(string $path, array $records): void
{
    file_put_contents(
        $path,
        json_encode(array_values($records), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
    );
}

function normalizeString($value, string $fallback = ''): string
{
    if ($value === null) {
        return $fallback;
    }

    $text = trim((string) $value);
    return $text === '' ? $fallback : $text;
}

function normalizeArray($value): array
{
    return is_array($value) ? $value : [];
}

function makeLogId(): string
{
    try {
        return 'verification-' . (int) round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(4));
    } catch (Throwable $error) {
        return 'verification-' . uniqid('', true);
    }
}

function normalizeUser(array $user): array
{
    return [
        'id' => $user['id'] ?? null,
        'name' => normalizeString($user['name'] ?? null, 'Administrator'),
        'role' => strtolower(normalizeString($user['role'] ?? null, 'admin')),
        'email' => normalizeString($user['email'] ?? null),
    ];
}

function normalizeIpAddress($value): ?string
{
    $ip = normalizeString($value);
    if ($ip === '') {
        return null;
    }

    $normalized = strtolower($ip);
    if (
        $normalized === '::1' ||
        $normalized === '127.0.0.1' ||
        $normalized === '::ffff:127.0.0.1' ||
        $normalized === 'localhost'
    ) {
        return null;
    }

    return $ip;
}

function filterRecords(array $records): array
{
    $action = normalizeString($_GET['action'] ?? null);
    $startDate = normalizeString($_GET['start_date'] ?? null);
    $endDate = normalizeString($_GET['end_date'] ?? null);

    return array_values(array_filter($records, function (array $record) use ($action, $startDate, $endDate): bool {
        if ($action !== '' && ($record['action'] ?? '') !== $action) {
            return false;
        }

        $createdAt = isset($record['created_at']) ? strtotime((string) $record['created_at']) : false;
        if ($createdAt === false) {
            return true;
        }

        if ($startDate !== '') {
            $startAt = strtotime($startDate . ' 00:00:00');
            if ($startAt !== false && $createdAt < $startAt) {
                return false;
            }
        }

        if ($endDate !== '') {
            $endAt = strtotime($endDate . ' 23:59:59');
            if ($endAt !== false && $createdAt > $endAt) {
                return false;
            }
        }

        return true;
    }));
}

ensureDirectory($storageDir);
$records = readRecords($storagePath);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    usort($records, function (array $left, array $right): int {
        return strcmp((string) ($right['created_at'] ?? ''), (string) ($left['created_at'] ?? ''));
    });

    sendJson([
        'data' => filterRecords($records),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['message' => 'Method not allowed.'], 405);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    sendJson(['message' => 'Invalid request payload.'], 422);
}

$action = normalizeString($payload['action'] ?? null);
if (!in_array($action, $allowedActions, true)) {
    sendJson(['message' => 'Unsupported verification action.'], 422);
}

$subjectName = normalizeString($payload['subject_name'] ?? null, 'Resident');
$auditableType = normalizeString($payload['auditable_type'] ?? null, 'resident');
$createdAt = gmdate('c');

$entry = [
    'id' => makeLogId(),
    'action' => $action,
    'auditable_type' => $auditableType,
    'auditable_id' => $payload['auditable_id'] ?? null,
    'user' => normalizeUser(normalizeArray($payload['user'] ?? [])),
    'old_values' => normalizeArray($payload['old_values'] ?? []),
    'new_values' => normalizeArray($payload['new_values'] ?? []),
    'created_at' => $createdAt,
    'subject_name' => $subjectName,
    'ip_address' => normalizeIpAddress($_SERVER['REMOTE_ADDR'] ?? null),
    'source' => 'verification',
    'metadata' => normalizeArray($payload['metadata'] ?? []),
];

$records[] = $entry;
usort($records, function (array $left, array $right): int {
    return strcmp((string) ($right['created_at'] ?? ''), (string) ($left['created_at'] ?? ''));
});

writeRecords($storagePath, $records);

sendJson([
    'success' => true,
    'data' => $entry,
], 201);
