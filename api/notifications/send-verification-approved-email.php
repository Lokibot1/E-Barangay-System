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

$storageDir = __DIR__ . '/storage';
$logPath = $storageDir . '/verification-approved-email-log.json';

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

$appendLog = function ($entry) use ($logPath) {
    $items = [];
    if (file_exists($logPath)) {
        $raw = file_get_contents($logPath);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $items = $decoded;
        }
    }
    $items[] = $entry;
    file_put_contents($logPath, json_encode($items, JSON_PRETTY_PRINT));
};

$payload = $readPayload();

$email = trim((string)($payload['email'] ?? ''));
$name = trim((string)($payload['name'] ?? 'Resident'));
$barangayId = trim((string)($payload['barangay_id'] ?? 'N/A'));
$username = trim((string)($payload['username'] ?? 'N/A'));
$temporaryPassword = trim((string)($payload['temporary_password'] ?? ''));
$verificationUrl = trim((string)($payload['verification_url'] ?? ''));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['message' => 'A valid email address is required.']);
    exit;
}

if ($temporaryPassword === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Temporary password is required.']);
    exit;
}

$subject = 'Your E-Barangay registration has been approved';
$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeBarangayId = htmlspecialchars($barangayId, ENT_QUOTES, 'UTF-8');
$safeUsername = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
$safePassword = htmlspecialchars($temporaryPassword, ENT_QUOTES, 'UTF-8');
$safeVerificationUrl = htmlspecialchars($verificationUrl, ENT_QUOTES, 'UTF-8');

$verificationBlock = $verificationUrl !== ''
    ? '<p style="margin:16px 0 0;">Verification page: <a href="' . $safeVerificationUrl . '">' . $safeVerificationUrl . '</a></p>'
    : '';

$htmlMessage = <<<HTML
<html>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <div style="background:#2563eb;color:#ffffff;padding:24px 28px;">
      <h1 style="margin:0;font-size:22px;">Registration Approved</h1>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.92;">Your resident account is now verified and ready for first login.</p>
    </div>
    <div style="padding:28px;">
      <p style="margin-top:0;">Hello {$safeName},</p>
      <p>Your E-Barangay registration has been approved. Here are your account details:</p>
      <div style="margin:20px 0;padding:18px;border:1px solid #dbeafe;border-radius:14px;background:#eff6ff;">
        <p style="margin:0 0 10px;"><strong>Barangay ID:</strong> {$safeBarangayId}</p>
        <p style="margin:0 0 10px;"><strong>Username:</strong> {$safeUsername}</p>
        <p style="margin:0;"><strong>Temporary Password:</strong> {$safePassword}</p>
      </div>
      <p style="margin:0;">Please change your temporary password immediately after your first login.</p>
      {$verificationBlock}
      <p style="margin:24px 0 0;">Thank you,<br>E-Barangay Integrated Services</p>
    </div>
  </div>
</body>
</html>
HTML;

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: E-Barangay Integrated Services <no-reply@e-barangay.local>',
];

$sent = @mail($email, $subject, $htmlMessage, implode("\r\n", $headers));

$appendLog([
    'email' => $email,
    'name' => $name,
    'barangay_id' => $barangayId,
    'username' => $username,
    'sent' => $sent,
    'created_at' => date('c'),
]);

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Approval email could not be sent. Please check the server mail configuration.',
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Approval email sent successfully.',
]);
