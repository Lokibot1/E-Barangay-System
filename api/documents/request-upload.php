<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$projectRoot = dirname(__DIR__, 2);
$storageRoots = [
    $projectRoot . '/storage/app/public',
    dirname($projectRoot) . '/DS-subsystem/storage/app/public',
];

$documentConfig = [
    'BID' => [
        'table' => 'barangay_id_requests',
        'uploadField' => 'valid_id_file_path',
        'label' => 'Barangay ID',
    ],
    'COI' => [
        'table' => 'coi_requests',
        'uploadField' => 'uploaded_file',
        'label' => 'Certificate of Indigency',
    ],
    'COR' => [
        'table' => 'cor_requests',
        'uploadField' => 'uploaded_file',
        'label' => 'Certificate of Residency',
    ],
];

function sendJson(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function normalizeString($value, string $fallback = ''): string
{
    if ($value === null) {
        return $fallback;
    }

    $text = trim((string) $value);
    return $text === '' ? $fallback : $text;
}

function normalizePath(string $path): string
{
    return str_replace('\\', '/', $path);
}

function getAppBaseUrlPath(): string
{
    $scriptDir = normalizePath(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $basePath = dirname(dirname($scriptDir));

    if ($basePath === '.' || $basePath === DIRECTORY_SEPARATOR) {
        return '';
    }

    return rtrim($basePath, '/');
}

function getAbsoluteUrl(string $relativePath): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $relative = '/' . ltrim($relativePath, '/');

    return $scheme . '://' . $host . $relative;
}

function resolveDocumentsHost(): string
{
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '127.0.0.1';
    return preg_replace('/:\d+$/', '', $host);
}

function buildRemoteStorageUrl(string $relativePath): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = resolveDocumentsHost();
    return sprintf(
        '%s://%s:8001/storage/%s',
        $scheme,
        $host,
        ltrim(str_replace('\\', '/', $relativePath), '/')
    );
}

function guessMimeType(string $filePath, string $relativePath): string
{
    if (is_file($filePath)) {
        $detected = mime_content_type($filePath);
        if ($detected) {
            return $detected;
        }
    }

    $extension = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));
    return match ($extension) {
        'jpg', 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'bmp' => 'image/bmp',
        'pdf' => 'application/pdf',
        default => 'application/octet-stream',
    };
}

function isPreviewImage(string $relativePath): bool
{
    $extension = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));
    return in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'], true);
}

function resolveStorageFilePath(string $relativePath, array $storageRoots): ?string
{
    $sanitizedPath = ltrim(str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $relativePath), DIRECTORY_SEPARATOR);

    foreach ($storageRoots as $root) {
        $candidate = rtrim($root, '\\/') . DIRECTORY_SEPARATOR . $sanitizedPath;
        if (is_file($candidate)) {
            return $candidate;
        }
    }

    return null;
}

function buildResponseRecord(array $row, array $config, string $uploadPath): array
{
    $details = $row;

    return array_merge($row, [
        'documentType' => $config['label'],
        'document_type' => $row['document_type'] ?? $config['label'],
        'dateSubmitted' => $row['dateSubmitted'] ?? ($row['created_at'] ?? null),
        'uploaded_file_name' => $uploadPath !== '' ? basename($uploadPath) : '',
        'details' => $details,
    ]);
}

function fetchRequestRecord(mysqli $connection, string $reference, array $documentConfig): ?array
{
    $prefix = strtoupper(strtok($reference, '-'));
    if (!isset($documentConfig[$prefix])) {
        return null;
    }

    $config = $documentConfig[$prefix];
    $sql = sprintf(
        'SELECT * FROM %s WHERE reference_number = ? LIMIT 1',
        $config['table']
    );

    $statement = $connection->prepare($sql);
    $statement->bind_param('s', $reference);
    $statement->execute();
    $result = $statement->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $statement->close();

    if (!$row) {
        return null;
    }

    $uploadPath = normalizeString($row[$config['uploadField']] ?? '');

    return [
        'reference' => $row['reference_number'],
        'documentType' => $config['label'],
        'relativePath' => $uploadPath,
        'record' => buildResponseRecord($row, $config, $uploadPath),
    ];
}

$reference = strtoupper(normalizeString($_GET['reference'] ?? null));
if ($reference === '' || !preg_match('/^(BID|COI|COR)-\d{4}-\d{5}$/', $reference)) {
    sendJson(['message' => 'A valid document reference number is required.'], 422);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $connection = new mysqli('localhost', 'root', '', 'bgd');
    $connection->set_charset('utf8mb4');
    $record = fetchRequestRecord($connection, $reference, $documentConfig);
    $connection->close();
} catch (Throwable $error) {
    sendJson([
        'message' => 'Unable to read document upload details.',
        'details' => $error->getMessage(),
    ], 500);
}

if (!$record) {
    sendJson(['message' => 'No request record was found for this reference number.'], 404);
}

$hasUpload = normalizeString($record['relativePath']) !== '';
$localFilePath = $hasUpload ? resolveStorageFilePath($record['relativePath'], $storageRoots) : null;
$remoteStorageUrl = $hasUpload ? buildRemoteStorageUrl($record['relativePath']) : null;
$assetUrl = $hasUpload
    ? getAbsoluteUrl(
        getAppBaseUrlPath() . '/api/documents/request-upload.php?asset=1&reference=' . rawurlencode($reference)
    )
    : null;

if (isset($_GET['asset'])) {
    if (!$hasUpload) {
        sendJson(['message' => 'No uploaded file was found for this request.'], 404);
    }

    if ($localFilePath && is_file($localFilePath)) {
        header('Content-Type: ' . guessMimeType($localFilePath, $record['relativePath']));
        header('Cache-Control: public, max-age=3600');
        header(
            'Content-Disposition: inline; filename="' .
            addslashes(basename($record['relativePath'])) .
            '"'
        );
        readfile($localFilePath);
        exit;
    }

    header('Location: ' . $remoteStorageUrl, true, 302);
    exit;
}

$extension = $hasUpload ? strtolower(pathinfo($record['relativePath'], PATHINFO_EXTENSION)) : '';
$mimeType = $hasUpload ? guessMimeType($localFilePath ?: '', $record['relativePath']) : '';

sendJson([
    'success' => true,
    'data' => [
        'reference' => $reference,
        'documentType' => $record['documentType'],
        'record' => $record['record'],
        'hasUpload' => $hasUpload,
        'fileName' => $hasUpload ? basename($record['relativePath']) : '',
        'filePath' => $hasUpload ? $record['relativePath'] : null,
        'extension' => $extension,
        'mimeType' => $mimeType,
        'isImage' => $hasUpload ? isPreviewImage($record['relativePath']) : false,
        'isPdf' => $extension === 'pdf',
        'localAvailable' => $localFilePath !== null,
        'assetUrl' => $assetUrl,
        'storageUrl' => $remoteStorageUrl,
    ],
]);
