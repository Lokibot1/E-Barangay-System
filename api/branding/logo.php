<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$metadataDir = __DIR__ . '/storage';
$metadataPath = $metadataDir . '/logo.json';
$projectRoot = dirname(__DIR__, 2);
$storageRoot = $projectRoot . '/storage/app/public/branding';
$publicRoot = $projectRoot . '/public';
$publicStoragePath = $publicRoot . '/storage';

function ensureDirectory(string $path): void
{
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }
}

function normalizePath(string $path): string
{
    return rtrim(str_replace('\\', '/', $path), '/');
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

function readLogoRecord(string $metadataPath): array
{
    if (!file_exists($metadataPath)) {
        return [];
    }

    $raw = file_get_contents($metadataPath);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function writeLogoRecord(string $metadataPath, array $record): void
{
    file_put_contents(
        $metadataPath,
        json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
    );
}

function getMimeExtension(string $mimeType): ?string
{
    $map = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/webp' => 'webp',
    ];

    return $map[strtolower($mimeType)] ?? null;
}

function decodeImageDataUrl(string $dataUrl): array
{
    if (!preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/', $dataUrl, $matches)) {
        throw new RuntimeException('Invalid image format.');
    }

    $mimeType = strtolower($matches[1]);
    $extension = getMimeExtension($mimeType);
    if ($extension === null) {
        throw new RuntimeException('Unsupported image type.');
    }

    $binary = base64_decode(str_replace(' ', '+', $matches[2]), true);
    if ($binary === false) {
        throw new RuntimeException('Invalid image data.');
    }

    return [
        'mimeType' => $mimeType,
        'extension' => $extension,
        'binary' => $binary,
    ];
}

function getLogoFilePath(array $record, string $storageRoot): ?string
{
    if (empty($record['fileName'])) {
        return null;
    }

    return $storageRoot . '/' . basename($record['fileName']);
}

function isStorageLinked(string $publicStoragePath, string $expectedTarget): bool
{
    if (!file_exists($publicStoragePath)) {
        return false;
    }

    $actual = realpath($publicStoragePath);
    $expected = realpath($expectedTarget);

    if ($actual === false || $expected === false) {
        return false;
    }

    return normalizePath($actual) === normalizePath($expected);
}

function getLogoAssetUrl(array $record, string $publicStoragePath, string $storageRoot): string
{
    $basePath = getAppBaseUrlPath();
    $hasLinkedStorage = isStorageLinked($publicStoragePath, dirname($storageRoot));

    if (!empty($record['fileName']) && $hasLinkedStorage) {
        return getAbsoluteUrl(
            $basePath . '/public/storage/branding/' . rawurlencode($record['fileName'])
        );
    }

    return getAbsoluteUrl($basePath . '/api/branding/logo.php?asset=1');
}

function removePreviousLogo(array $record, string $storageRoot): void
{
    $existingFile = getLogoFilePath($record, $storageRoot);
    if ($existingFile && file_exists($existingFile)) {
        unlink($existingFile);
    }
}

function streamLogoAsset(array $record, string $storageRoot): void
{
    $filePath = getLogoFilePath($record, $storageRoot);
    if ($filePath && file_exists($filePath)) {
        header('Content-Type: ' . ($record['mimeType'] ?? mime_content_type($filePath) ?: 'application/octet-stream'));
        header('Cache-Control: public, max-age=31536000');
        readfile($filePath);
        exit;
    }

    if (!empty($record['dataUrl']) && strpos($record['dataUrl'], 'data:image/') === 0) {
        $decoded = decodeImageDataUrl($record['dataUrl']);
        header('Content-Type: ' . $decoded['mimeType']);
        header('Cache-Control: no-cache');
        echo $decoded['binary'];
        exit;
    }

    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Logo asset not found.']);
    exit;
}

ensureDirectory($metadataDir);
ensureDirectory($storageRoot);
ensureDirectory($publicRoot);

$record = readLogoRecord($metadataPath);

if (isset($_GET['asset'])) {
    streamLogoAsset($record, $storageRoot);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');

    if (!$record) {
        echo json_encode(['dataUrl' => '']);
        exit;
    }

    if (!empty($record['fileName']) && file_exists(getLogoFilePath($record, $storageRoot) ?: '')) {
        $assetUrl = getLogoAssetUrl($record, $publicStoragePath, $storageRoot);
        echo json_encode([
            'dataUrl' => $assetUrl,
            'imageUrl' => $assetUrl,
            'updatedAt' => $record['updatedAt'] ?? null,
            'storageLinked' => isStorageLinked($publicStoragePath, dirname($storageRoot)),
        ]);
        exit;
    }

    echo json_encode([
        'dataUrl' => $record['dataUrl'] ?? '',
        'updatedAt' => $record['updatedAt'] ?? null,
        'storageLinked' => false,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    header('Content-Type: application/json');

    removePreviousLogo($record, $storageRoot);

    if (file_exists($metadataPath)) {
        unlink($metadataPath);
    }

    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
$dataUrl = isset($payload['dataUrl']) ? trim((string) $payload['dataUrl']) : '';

if ($dataUrl === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Logo data is required.']);
    exit;
}

try {
    $decoded = decodeImageDataUrl($dataUrl);
} catch (RuntimeException $error) {
    http_response_code(422);
    echo json_encode(['message' => $error->getMessage()]);
    exit;
}

removePreviousLogo($record, $storageRoot);

$fileName = 'logo-' . time() . '.' . $decoded['extension'];
$filePath = $storageRoot . '/' . $fileName;
file_put_contents($filePath, $decoded['binary']);

$record = [
    'fileName' => $fileName,
    'mimeType' => $decoded['mimeType'],
    'updatedAt' => date('c'),
];

writeLogoRecord($metadataPath, $record);

$assetUrl = getLogoAssetUrl($record, $publicStoragePath, $storageRoot);

echo json_encode([
    'dataUrl' => $assetUrl,
    'imageUrl' => $assetUrl,
    'updatedAt' => $record['updatedAt'],
    'storageLinked' => isStorageLinked($publicStoragePath, dirname($storageRoot)),
]);
