<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storageDir = __DIR__ . '/storage';
$mediaDir = $storageDir . '/media';
$storagePath = $storageDir . '/announcements.json';
$legacyStorageDir = dirname(__DIR__) . '/announcements/storage';
$legacyMediaDir = $legacyStorageDir . '/media';
$legacyStoragePath = $legacyStorageDir . '/announcements.json';

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
    return $scheme . '://' . $host . '/' . ltrim($relativePath, '/');
}

function sanitizeText($value, string $fallback = ''): string
{
    $text = trim((string) $value);
    return $text !== '' ? $text : $fallback;
}

function sanitizeBoolean($value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    $normalized = strtolower(trim((string) $value));
    return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
}

function loadAnnouncementsFromPath(string $path): array
{
    if (!file_exists($path)) {
        return [];
    }

    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveAnnouncementsToPath(string $path, array $items): void
{
    file_put_contents(
        $path,
        json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
}

function copyLegacyDirectoryContents(string $sourceDir, string $targetDir): void
{
    if (!is_dir($sourceDir)) {
        return;
    }

    ensureDirectory($targetDir);

    $entries = scandir($sourceDir);
    if (!is_array($entries)) {
        return;
    }

    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }

        $sourcePath = $sourceDir . '/' . $entry;
        $targetPath = $targetDir . '/' . $entry;

        if (is_dir($sourcePath)) {
            copyLegacyDirectoryContents($sourcePath, $targetPath);
            continue;
        }

        if (!file_exists($targetPath)) {
            copy($sourcePath, $targetPath);
        }
    }
}

function migrateLegacyAnnouncementStorage(
    string $storagePath,
    string $mediaDir,
    string $legacyStoragePath,
    string $legacyMediaDir
): void {
    if (file_exists($storagePath) || !file_exists($legacyStoragePath)) {
        return;
    }

    ensureDirectory(dirname($storagePath));
    copy($legacyStoragePath, $storagePath);
    copyLegacyDirectoryContents($legacyMediaDir, $mediaDir);
}

function getAnnouncementEndpointBasePath(): string
{
    $basePath = getAppBaseUrlPath();
    return ltrim($basePath . '/api/resident-information', '/');
}

function buildMediaUrl(string $filename): ?string
{
    $safeFileName = sanitizeText($filename);
    if ($safeFileName === '') {
        return null;
    }

    return getAbsoluteUrl(
        getAnnouncementEndpointBasePath() . '/storage/media/' . rawurlencode($safeFileName)
    );
}

function sanitizeUploadedMedia($file): ?array
{
    if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ((int) ($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Unable to upload the attached media file.');
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');
    $originalName = sanitizeText($file['name'] ?? '', 'announcement-media');
    $size = (int) ($file['size'] ?? 0);

    $detectedType = trim((string) ($file['type'] ?? ''));
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_file($finfo, $tmpName);
            if (is_string($detected) && $detected !== '') {
                $detectedType = $detected;
            }
            finfo_close($finfo);
        }
    }

    $allowedTypes = [
        'image/jpeg' => ['kind' => 'image', 'max' => 10 * 1024 * 1024, 'ext' => 'jpg'],
        'image/png' => ['kind' => 'image', 'max' => 10 * 1024 * 1024, 'ext' => 'png'],
        'image/webp' => ['kind' => 'image', 'max' => 10 * 1024 * 1024, 'ext' => 'webp'],
        'video/mp4' => ['kind' => 'video', 'max' => 100 * 1024 * 1024, 'ext' => 'mp4'],
        'video/webm' => ['kind' => 'video', 'max' => 100 * 1024 * 1024, 'ext' => 'webm'],
        'video/quicktime' => ['kind' => 'video', 'max' => 100 * 1024 * 1024, 'ext' => 'mov'],
    ];

    if (!array_key_exists($detectedType, $allowedTypes)) {
        throw new RuntimeException('Attached media must be JPG, PNG, WEBP, MP4, WEBM, or MOV.');
    }

    $rule = $allowedTypes[$detectedType];
    if ($size <= 0 || $size > $rule['max']) {
        if ($rule['kind'] === 'video') {
            throw new RuntimeException('Attached video must be 100 MB or smaller.');
        }

        throw new RuntimeException('Attached image must be 10 MB or smaller.');
    }

    return [
        'tmp_name' => $tmpName,
        'name' => $originalName,
        'type' => $detectedType,
        'size' => $size,
        'kind' => $rule['kind'],
        'ext' => $rule['ext'],
    ];
}

function storeUploadedMedia(?array $media, string $mediaDir): array
{
    if ($media === null) {
        return [
            'media_file' => null,
            'media_kind' => null,
            'media_type' => null,
            'media_name' => null,
            'media_size' => 0,
        ];
    }

    $filename = sprintf(
        '%s-%s.%s',
        date('YmdHis'),
        bin2hex(random_bytes(6)),
        $media['ext']
    );

    $targetPath = $mediaDir . '/' . $filename;
    if (!move_uploaded_file($media['tmp_name'], $targetPath)) {
        throw new RuntimeException('Unable to save the uploaded media file.');
    }

    return [
        'media_file' => $filename,
        'media_kind' => $media['kind'],
        'media_type' => $media['type'],
        'media_name' => $media['name'],
        'media_size' => $media['size'],
    ];
}

function normalizeAnnouncementRecord(array $item): array
{
    $mediaFile = sanitizeText($item['media_file'] ?? '');

    return [
        'id' => (string) ($item['id'] ?? ''),
        'tag' => sanitizeText($item['tag'] ?? '', 'Advisory'),
        'title' => sanitizeText($item['title'] ?? '', 'Untitled announcement'),
        'desc' => trim((string) ($item['desc'] ?? '')),
        'fullContent' => trim((string) ($item['fullContent'] ?? '')),
        'urgent' => !empty($item['urgent']),
        'publish_at' => sanitizeText($item['publish_at'] ?? '', date('c')),
        'event_date' => sanitizeText($item['event_date'] ?? ''),
        'event_start_time' => sanitizeText($item['event_start_time'] ?? ''),
        'event_end_time' => sanitizeText($item['event_end_time'] ?? ''),
        'event_location' => sanitizeText($item['event_location'] ?? ''),
        'created_at' => sanitizeText($item['created_at'] ?? '', date('c')),
        'updated_at' => sanitizeText($item['updated_at'] ?? '', date('c')),
        'source' => sanitizeText($item['source'] ?? '', 'announcements'),
        'media_file' => $mediaFile !== '' ? $mediaFile : null,
        'media_url' => $mediaFile !== '' ? buildMediaUrl($mediaFile) : null,
        'media_kind' => sanitizeText($item['media_kind'] ?? ''),
        'media_type' => sanitizeText($item['media_type'] ?? ''),
        'media_name' => sanitizeText($item['media_name'] ?? ''),
        'media_size' => (int) ($item['media_size'] ?? 0),
    ];
}

ensureDirectory($storageDir);
ensureDirectory($mediaDir);
migrateLegacyAnnouncementStorage($storagePath, $mediaDir, $legacyStoragePath, $legacyMediaDir);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $items = array_map('normalizeAnnouncementRecord', loadAnnouncementsFromPath($storagePath));

    usort($items, function ($a, $b) {
        $aTime = strtotime($a['publish_at'] ?? $a['created_at'] ?? '') ?: 0;
        $bTime = strtotime($b['publish_at'] ?? $b['created_at'] ?? '') ?: 0;
        return $bTime <=> $aTime;
    });

    echo json_encode([
        'data' => $items,
        'meta' => [
            'total' => count($items),
        ],
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $items = loadAnnouncementsFromPath($storagePath);

        $requestedId = sanitizeText($_POST['id'] ?? '');
        $existingIndex = -1;
        $existingRecord = null;
        if ($requestedId !== '') {
            foreach ($items as $index => $item) {
                if ((string) ($item['id'] ?? '') === $requestedId) {
                    $existingIndex = $index;
                    $existingRecord = $item;
                    break;
                }
            }
        }

        $uploadedMedia = sanitizeUploadedMedia($_FILES['media_file'] ?? null);
        $clearMedia = sanitizeBoolean($_POST['clear_media'] ?? false);

        $title = sanitizeText($_POST['title'] ?? '');
        $tag = sanitizeText($_POST['tag'] ?? '', 'Advisory');
        $publishAt = sanitizeText($_POST['publish_at'] ?? '', date('c'));
        $eventDate = sanitizeText($_POST['event_date'] ?? '');
        $eventStartTime = sanitizeText($_POST['event_start_time'] ?? '');
        $eventEndTime = sanitizeText($_POST['event_end_time'] ?? '');
        $eventLocation = sanitizeText($_POST['event_location'] ?? '');

        if ($title === '') {
            http_response_code(422);
            echo json_encode(['message' => 'Announcement title is required.']);
            exit;
        }

        if (strcasecmp($tag, 'Event') === 0 && ($eventDate === '' || $eventStartTime === '')) {
            http_response_code(422);
            echo json_encode(['message' => 'Event announcements need an event date and start time.']);
            exit;
        }

        $recordId = $requestedId !== '' ? $requestedId : ('announcement-' . round(microtime(true) * 1000));
        $timestamp = date('c');
        $existingMediaFile = sanitizeText($existingRecord['media_file'] ?? '');
        $mediaPayload = [
            'media_file' => $existingMediaFile !== '' ? $existingMediaFile : null,
            'media_kind' => sanitizeText($existingRecord['media_kind'] ?? ''),
            'media_type' => sanitizeText($existingRecord['media_type'] ?? ''),
            'media_name' => sanitizeText($existingRecord['media_name'] ?? ''),
            'media_size' => (int) ($existingRecord['media_size'] ?? 0),
        ];

        if ($uploadedMedia !== null) {
            if ($existingMediaFile !== '') {
                $existingMediaPath = $mediaDir . '/' . $existingMediaFile;
                if (file_exists($existingMediaPath)) {
                    @unlink($existingMediaPath);
                }
            }

            $mediaPayload = storeUploadedMedia($uploadedMedia, $mediaDir);
        } elseif ($clearMedia) {
            if ($existingMediaFile !== '') {
                $existingMediaPath = $mediaDir . '/' . $existingMediaFile;
                if (file_exists($existingMediaPath)) {
                    @unlink($existingMediaPath);
                }
            }

            $mediaPayload = [
                'media_file' => null,
                'media_kind' => null,
                'media_type' => null,
                'media_name' => null,
                'media_size' => 0,
            ];
        }

        $record = [
            'id' => $recordId,
            'tag' => $tag,
            'title' => $title,
            'desc' => trim((string) ($_POST['desc'] ?? '')),
            'fullContent' => trim((string) ($_POST['fullContent'] ?? '')),
            'urgent' => sanitizeBoolean($_POST['urgent'] ?? false),
            'publish_at' => $publishAt,
            'event_date' => $eventDate,
            'event_start_time' => $eventStartTime,
            'event_end_time' => $eventEndTime,
            'event_location' => $eventLocation,
            'created_at' => $existingRecord !== null
                ? sanitizeText($existingRecord['created_at'] ?? '', $timestamp)
                : sanitizeText($_POST['created_at'] ?? '', $timestamp),
            'updated_at' => $timestamp,
            'source' => sanitizeText(
                $_POST['source'] ?? ($existingRecord['source'] ?? ''),
                'announcements'
            ),
            'media_file' => $mediaPayload['media_file'],
            'media_kind' => $mediaPayload['media_kind'],
            'media_type' => $mediaPayload['media_type'],
            'media_name' => $mediaPayload['media_name'],
            'media_size' => $mediaPayload['media_size'],
        ];

        if ($existingIndex >= 0) {
            $items[$existingIndex] = $record;
        } else {
            $items[] = $record;
        }

        saveAnnouncementsToPath($storagePath, $items);

        echo json_encode([
            'data' => normalizeAnnouncementRecord($record),
        ]);
        exit;
    } catch (RuntimeException $error) {
        http_response_code(422);
        echo json_encode(['message' => $error->getMessage()]);
        exit;
    } catch (Throwable $error) {
        http_response_code(500);
        echo json_encode(['message' => 'Unable to save this announcement right now.']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = sanitizeText($_GET['id'] ?? '');

    if ($id === '') {
        http_response_code(422);
        echo json_encode(['message' => 'Announcement ID is required.']);
        exit;
    }

    $items = loadAnnouncementsFromPath($storagePath);
    $removedRecord = null;
    $remaining = [];

    foreach ($items as $item) {
        if ((string) ($item['id'] ?? '') === $id) {
            $removedRecord = $item;
            continue;
        }

        $remaining[] = $item;
    }

    if ($removedRecord === null) {
        http_response_code(404);
        echo json_encode(['message' => 'Announcement not found.']);
        exit;
    }

    $mediaFile = sanitizeText($removedRecord['media_file'] ?? '');
    if ($mediaFile !== '') {
        $mediaPath = $mediaDir . '/' . $mediaFile;
        if (file_exists($mediaPath)) {
            @unlink($mediaPath);
        }
    }

    saveAnnouncementsToPath($storagePath, $remaining);

    echo json_encode([
        'success' => true,
        'id' => $id,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
