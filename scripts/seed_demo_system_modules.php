<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script can only run from the command line.\n");
    exit(1);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$options = getopt('', [
    'incidents::',
    'complaints::',
    'appointments::',
    'bid::',
    'coi::',
    'cor::',
    'notifications::',
]);

$incidentCount = isset($options['incidents']) ? max(1, (int) $options['incidents']) : 54;
$complaintCount = isset($options['complaints']) ? max(1, (int) $options['complaints']) : 42;
$appointmentCount = isset($options['appointments']) ? max(1, (int) $options['appointments']) : 30;
$barangayIdCount = isset($options['bid']) ? max(1, (int) $options['bid']) : 30;
$coiCount = isset($options['coi']) ? max(1, (int) $options['coi']) : 24;
$corCount = isset($options['cor']) ? max(1, (int) $options['cor']) : 18;
$notificationCount = isset($options['notifications']) ? max(1, (int) $options['notifications']) : 60;

$conn = new mysqli('localhost', 'root', '', 'bgd');
$conn->set_charset('utf8mb4');

function fetchRows(mysqli $conn, string $sql): array
{
    $result = $conn->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    return $rows;
}

function fetchFirstColumn(mysqli $conn, string $sql): array
{
    $rows = fetchRows($conn, $sql);
    return array_map(static fn ($row) => array_values($row)[0] ?? null, $rows);
}

function pick(array $values, int $index, $fallback = null)
{
    if ($values === []) {
        return $fallback;
    }
    return $values[$index % count($values)];
}

function buildPool(array $distribution, int $count, string $fallback): array
{
    $pool = [];
    foreach ($distribution as $value => $qty) {
        for ($i = 0; $i < $qty; $i++) {
            $pool[] = $value;
        }
    }
    while (count($pool) < $count) {
        $pool[] = $fallback;
    }
    return array_slice($pool, 0, $count);
}

function nextReferenceSequence(mysqli $conn, string $table): int
{
    $row = $conn
        ->query(
            "SELECT MAX(CAST(SUBSTRING_INDEX(reference_number, '-', -1) AS UNSIGNED)) AS max_ref
             FROM {$table}
             WHERE reference_number LIKE '%-%-%'"
        )
        ->fetch_assoc();

    return (int) ($row['max_ref'] ?? 0) + 1;
}

function nextNotificationType(array $types, int $index): string
{
    return pick($types, $index, 'notification');
}

function snapshotCounts(mysqli $conn): array
{
    $counts = [];
    foreach ([
        'residents',
        'incidents',
        'complaints',
        'appointments',
        'barangay_id_requests',
        'coi_requests',
        'cor_requests',
        'notifications',
        'case_updates',
    ] as $table) {
        $where = $table === 'residents' ? ' WHERE deleted_at IS NULL' : '';
        $row = $conn->query("SELECT COUNT(*) AS total FROM {$table}{$where}")->fetch_assoc();
        $counts[$table] = (int) ($row['total'] ?? 0);
    }
    return $counts;
}

$beforeCounts = snapshotCounts($conn);

$adminIds = fetchFirstColumn($conn, "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC");
$residentUserRows = fetchRows(
    $conn,
    "SELECT id, name, email
     FROM users
     WHERE role = 'resident'
     ORDER BY id ASC"
);
$residentUserIds = array_map(static fn ($row) => (int) $row['id'], $residentUserRows);
$incidentTypeRows = fetchRows($conn, "SELECT id, name FROM incident_types ORDER BY id ASC");
$purokRows = fetchRows($conn, "SELECT id, name FROM puroks ORDER BY id ASC");
$streetRows = fetchRows($conn, "SELECT id, purok_id, name FROM streets ORDER BY id ASC");
$bidFilePaths = fetchFirstColumn(
    $conn,
    "SELECT valid_id_file_path
     FROM barangay_id_requests
     WHERE valid_id_file_path IS NOT NULL AND valid_id_file_path <> ''
     ORDER BY id DESC
     LIMIT 10"
);
$coiFilePaths = fetchFirstColumn(
    $conn,
    "SELECT uploaded_file
     FROM coi_requests
     WHERE uploaded_file IS NOT NULL AND uploaded_file <> ''
     ORDER BY id DESC
     LIMIT 10"
);

if ($adminIds === [] || $residentUserIds === [] || $incidentTypeRows === [] || $purokRows === [] || $streetRows === []) {
    fwrite(STDERR, "Seeder could not find the required lookup data.\n");
    exit(1);
}

$streetsByPurok = [];
foreach ($streetRows as $streetRow) {
    $streetsByPurok[(int) $streetRow['purok_id']][] = $streetRow;
}

$timezone = new DateTimeZone('Asia/Manila');
$now = new DateTimeImmutable('now', $timezone);
$year = (int) $now->format('Y');
$primaryAdminId = (int) ($adminIds[0] ?? 1);
$secondaryAdminId = (int) ($adminIds[1] ?? $primaryAdminId);

$incidentStatuses = buildPool([
    'pending' => 15,
    'dispatched' => 10,
    'on-site' => 10,
    'resolved' => 11,
    'rejected' => 8,
], $incidentCount, 'pending');

$complaintStatuses = buildPool([
    'pending' => 12,
    'in-progress' => 12,
    'resolved' => 10,
    'rejected' => 8,
], $complaintCount, 'pending');

$appointmentStatuses = buildPool([
    'scheduled' => 10,
    'rescheduled' => 8,
    'completed' => 6,
    'cancelled' => 3,
    'no-show' => 3,
], $appointmentCount, 'scheduled');

$documentStatuses = static function (int $count): array {
    return buildPool([
        'Pending' => max(1, (int) round($count * 0.48)),
        'Verified' => max(1, (int) round($count * 0.32)),
        'Rejected' => max(1, (int) round($count * 0.20)),
    ], $count, 'Pending');
};

$complaintTypes = [
    'Noise Complaint',
    'Property Concern',
    'Neighborhood Conflict',
    'Barangay Dispute',
    'Harassment',
    'Trespassing',
];

$complaintResolutions = [
    'Formal hearing',
    'Written agreement',
    'Community warning',
    'Mediation settlement',
    'Barangay monitoring',
];

$incidentDescriptions = [
    'Streetlight outage reported near the main road.',
    'Loose drainage cover creating a road hazard.',
    'Water line leak observed beside a residential block.',
    'Blocked alley due to construction materials.',
    'Public safety concern caused by damaged electric post.',
    'Floodwater buildup reported after heavy rain.',
];

$complainantNames = [
    'Angela Mendoza',
    'Renz TV Aggabao',
    'Angelica Santos',
    'Noel Fernandez',
    'Paula Reyes',
    'Carlo Bautista',
    'Hazel Rivera',
    'Vince Torres',
];

$respondentNames = [
    'Alvin Castro',
    'Mario Dizon',
    'Lito Mendoza',
    'Mark Flores',
    'Dennis Cruz',
    'Paolo Reyes',
    'Kristine Santos',
    'Rogelio Morales',
];

$notificationTypes = [
    'incident_reported',
    'complaint_status_updated',
    'appointment_scheduled',
    'document_request_submitted',
    'registration_pending',
];

$purposeOptions = [
    'Employment',
    'Scholarship',
    'School Enrollment',
    'Medical Assistance',
    'Government Requirement',
    'Financial Assistance',
];

$civilStatuses = ['Single', 'Married', 'Widowed', 'Separated'];
$bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'];
$genders = ['Male', 'Female'];

$seeded = [
    'incidents' => [],
    'complaints' => [],
    'appointments' => [],
    'documents' => [],
];

$incidentMaxIdRow = $conn->query("SELECT MAX(id) AS max_id FROM incidents")->fetch_assoc();
$incidentSeedBase = (int) ($incidentMaxIdRow['max_id'] ?? 0);

$complaintMaxIdRow = $conn->query("SELECT MAX(id) AS max_id FROM complaints")->fetch_assoc();
$complaintSeedBase = (int) ($complaintMaxIdRow['max_id'] ?? 0);

$insertIncident = $conn->prepare(
    "INSERT INTO incidents (
        description,
        evidence_path,
        location,
        latitude,
        longitude,
        additional_notes,
        created_at,
        updated_at,
        user_id,
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertIncidentType = $conn->prepare(
    "INSERT INTO incident_incident_type (
        incident_id,
        incident_type_id
    ) VALUES (?, ?)"
);

$insertComplaint = $conn->prepare(
    "INSERT INTO complaints (
        incident_date,
        incident_time,
        location,
        latitude,
        longitude,
        type,
        severity,
        description,
        complainant_name,
        complainant_contact,
        respondent_name,
        respondent_address,
        desired_resolution,
        evidence_path,
        additional_notes,
        created_at,
        updated_at,
        user_id,
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertWitness = $conn->prepare(
    "INSERT INTO witnesses (
        complaint_id,
        name,
        contact
    ) VALUES (?, ?, ?)"
);

$insertCaseUpdate = $conn->prepare(
    "INSERT INTO case_updates (
        reference_type,
        reference_id,
        user_id,
        event_type,
        old_status,
        new_status,
        message,
        attachment_path,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertAppointment = $conn->prepare(
    "INSERT INTO appointments (
        reference_type,
        reference_id,
        title,
        description,
        scheduled_at,
        status,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertNotification = $conn->prepare(
    "INSERT INTO notifications (
        user_id,
        type,
        message,
        data,
        read_at,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?)"
);

$insertBarangayId = $conn->prepare(
    "INSERT INTO barangay_id_requests (
        full_name,
        gender,
        age,
        reference_number,
        contact_number,
        date_of_birth,
        civil_status,
        email_address,
        purok_zone,
        street_address,
        emergency_contact_name,
        emergency_contact_number,
        blood_type,
        valid_id_file_path,
        created_at,
        updated_at,
        status,
        payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertCoi = $conn->prepare(
    "INSERT INTO coi_requests (
        full_name,
        reference_number,
        contact_number,
        date_of_birth,
        civil_status,
        email_address,
        purok_zone,
        street_address,
        purpose_of_request,
        specific_purpose,
        uploaded_file,
        created_at,
        updated_at,
        status,
        payment_status,
        gender,
        age
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertCor = $conn->prepare(
    "INSERT INTO cor_requests (
        full_name,
        gender,
        age,
        reference_number,
        contact_number,
        date_of_birth,
        civil_status,
        email_address,
        purok_zone,
        street_address,
        purpose_of_request,
        years_of_residency,
        uploaded_file,
        created_at,
        updated_at,
        status,
        payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$conn->begin_transaction();

try {
    for ($i = 0; $i < $incidentCount; $i++) {
        $seed = $incidentSeedBase + $i + 1;
        $status = $incidentStatuses[$i];
        $purok = pick($purokRows, $seed);
        $street = pick($streetsByPurok[(int) $purok['id']] ?? $streetRows, $seed);
        $incidentType = pick($incidentTypeRows, $seed);
        $createdAt = match ($status) {
            'pending' => $now->sub(new DateInterval('P' . (($seed % 8) + 1) . 'D')),
            'dispatched' => $now->sub(new DateInterval('P' . (($seed % 10) + 3) . 'D')),
            'on-site' => $now->sub(new DateInterval('P' . (($seed % 12) + 5) . 'D')),
            'resolved' => $now->sub(new DateInterval('P' . (($seed % 30) + 8) . 'D')),
            'rejected' => $now->sub(new DateInterval('P' . (($seed % 24) + 6) . 'D')),
            default => $now->sub(new DateInterval('P2D')),
        };
        $updatedAt = $createdAt->add(new DateInterval('PT' . (($seed % 16) + 2) . 'H'));
        if (in_array($status, ['resolved', 'rejected'], true)) {
            $updatedAt = $updatedAt->add(new DateInterval('P' . (($seed % 5) + 1) . 'D'));
        }

        $latitude = number_format(14.7105 + (($seed % 120) * 0.00005), 7, '.', '');
        $longitude = number_format(121.0335 + (($seed % 120) * 0.00004), 7, '.', '');
        $location = sprintf('%s, %s, Brgy. Gulod, Quezon City', $purok['name'], $street['name']);
        $description = pick($incidentDescriptions, $seed);
        $additionalNotes = match ($status) {
            'pending' => 'Waiting for barangay response team dispatch.',
            'dispatched' => 'Field personnel have been notified and dispatched.',
            'on-site' => 'Response team is currently validating the report on-site.',
            'resolved' => 'Issue has been addressed and marked as resolved.',
            'rejected' => 'Report was closed after duplicate or invalid validation.',
            default => 'Barangay system demo record.',
        };
        $userId = (string) pick($residentUserIds, $seed, $residentUserIds[0]);
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');
        $incidentTypeId = (string) $incidentType['id'];
        $evidencePath = null;

        $insertIncident->bind_param(
            str_repeat('s', 10),
            $description,
            $evidencePath,
            $location,
            $latitude,
            $longitude,
            $additionalNotes,
            $createdAtValue,
            $updatedAtValue,
            $userId,
            $status
        );
        $insertIncident->execute();

        $incidentId = (int) $insertIncident->insert_id;
        $insertIncidentType->bind_param('ss', $incidentId, $incidentTypeId);
        $insertIncidentType->execute();

        $referenceType = 'App\\Models\\Incident';
        $eventType = 'status_changed';
        $submittedMessage = 'Incident report submitted and entered into the operations queue.';
        $oldStatus = null;
        $newStatus = 'pending';
        $attachmentPath = null;

        $insertCaseUpdate->bind_param(
            str_repeat('s', 10),
            $referenceType,
            $incidentId,
            $primaryAdminId,
            $eventType,
            $oldStatus,
            $newStatus,
            $submittedMessage,
            $attachmentPath,
            $createdAtValue,
            $createdAtValue
        );
        $insertCaseUpdate->execute();

        if ($status !== 'pending') {
            $statusMessage = match ($status) {
                'dispatched' => 'Barangay responders were dispatched to the reported location.',
                'on-site' => 'The team is actively validating the report on-site.',
                'resolved' => 'The incident was resolved after barangay intervention.',
                'rejected' => 'The report was rejected after verification review.',
                default => 'Incident status updated.',
            };
            $oldStatus = 'pending';
            $newStatus = $status;

            $insertCaseUpdate->bind_param(
                str_repeat('s', 10),
                $referenceType,
                $incidentId,
                $secondaryAdminId,
                $eventType,
                $oldStatus,
                $newStatus,
                $statusMessage,
                $attachmentPath,
                $updatedAtValue,
                $updatedAtValue
            );
            $insertCaseUpdate->execute();
        }

        $seeded['incidents'][] = [
            'id' => $incidentId,
            'status' => $status,
            'location' => $location,
            'type' => $incidentType['name'],
        ];
    }

    for ($i = 0; $i < $complaintCount; $i++) {
        $seed = $complaintSeedBase + $i + 1;
        $status = $complaintStatuses[$i];
        $purok = pick($purokRows, $seed + 2);
        $street = pick($streetsByPurok[(int) $purok['id']] ?? $streetRows, $seed + 1);
        $complaintType = pick($complaintTypes, $seed);
        $createdAt = match ($status) {
            'pending' => $now->sub(new DateInterval('P' . (($seed % 8) + 2) . 'D')),
            'in-progress' => $now->sub(new DateInterval('P' . (($seed % 10) + 4) . 'D')),
            'resolved' => $now->sub(new DateInterval('P' . (($seed % 18) + 6) . 'D')),
            'rejected' => $now->sub(new DateInterval('P' . (($seed % 15) + 5) . 'D')),
            default => $now->sub(new DateInterval('P3D')),
        };
        $updatedAt = $createdAt->add(new DateInterval('PT' . (($seed % 10) + 2) . 'H'));
        if (in_array($status, ['resolved', 'rejected', 'in-progress'], true)) {
            $updatedAt = $updatedAt->add(new DateInterval('P' . (($seed % 4) + 1) . 'D'));
        }

        $complainantName = pick($complainantNames, $seed);
        $respondentName = pick($respondentNames, $seed + 3);
        $location = sprintf('%s, %s, Brgy. Gulod, Quezon City', $purok['name'], $street['name']);
        $incidentDate = $createdAt->format('Y-m-d');
        $incidentTime = sprintf('%02d:%02d:00', 8 + ($seed % 8), ($seed % 4) * 15);
        $latitude = number_format(14.7110 + (($seed % 100) * 0.00004), 7, '.', '');
        $longitude = number_format(121.0340 + (($seed % 100) * 0.00005), 7, '.', '');
        $description = sprintf('%s raised regarding %s at %s.', $complaintType, $respondentName, $location);
        $additionalNotes = match ($status) {
            'pending' => 'Awaiting mediation scheduling.',
            'in-progress' => 'Initial mediation discussion is ongoing.',
            'resolved' => 'Matter settled through barangay mediation.',
            'rejected' => 'Complaint closed after insufficient basis or duplicate filing.',
            default => 'Barangay system demo complaint.',
        };
        $desiredResolution = pick($complaintResolutions, $seed);
        $respondentAddress = sprintf('House %d, %s', ($seed % 70) + 10, $purok['name']);
        $complainantContact = '09' . str_pad((string) (200000000 + $seed), 9, '0', STR_PAD_LEFT);
        $severity = pick(['low', 'medium', 'high'], $seed, 'medium');
        $userId = (string) pick($residentUserIds, $seed + 1, $residentUserIds[0]);
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');
        $evidencePath = null;

        $insertComplaint->bind_param(
            str_repeat('s', 19),
            $incidentDate,
            $incidentTime,
            $location,
            $latitude,
            $longitude,
            $complaintType,
            $severity,
            $description,
            $complainantName,
            $complainantContact,
            $respondentName,
            $respondentAddress,
            $desiredResolution,
            $evidencePath,
            $additionalNotes,
            $createdAtValue,
            $updatedAtValue,
            $userId,
            $status
        );
        $insertComplaint->execute();

        $complaintId = (int) $insertComplaint->insert_id;
        $witnessName = pick(['Maria Lopez', 'Carlo Reyes', 'Angel Cruz', 'Jessa Flores'], $seed);
        $witnessContact = '09' . str_pad((string) (300000000 + $seed), 9, '0', STR_PAD_LEFT);
        $insertWitness->bind_param('sss', $complaintId, $witnessName, $witnessContact);
        $insertWitness->execute();

        $referenceType = 'App\\Models\\Complaint';
        $eventType = 'status_changed';
        $submittedMessage = 'Complaint received and entered into the mediation queue.';
        $oldStatus = null;
        $newStatus = 'pending';
        $attachmentPath = null;

        $insertCaseUpdate->bind_param(
            str_repeat('s', 10),
            $referenceType,
            $complaintId,
            $primaryAdminId,
            $eventType,
            $oldStatus,
            $newStatus,
            $submittedMessage,
            $attachmentPath,
            $createdAtValue,
            $createdAtValue
        );
        $insertCaseUpdate->execute();

        if ($status !== 'pending') {
            $statusMessage = match ($status) {
                'in-progress' => 'Complaint status moved to in-progress for active mediation.',
                'resolved' => 'Complaint was resolved and documented by the barangay.',
                'rejected' => 'Complaint was rejected after verification review.',
                default => 'Complaint status updated.',
            };
            $oldStatus = 'pending';
            $newStatus = $status;

            $insertCaseUpdate->bind_param(
                str_repeat('s', 10),
                $referenceType,
                $complaintId,
                $secondaryAdminId,
                $eventType,
                $oldStatus,
                $newStatus,
                $statusMessage,
                $attachmentPath,
                $updatedAtValue,
                $updatedAtValue
            );
            $insertCaseUpdate->execute();
        }

        $seeded['complaints'][] = [
            'id' => $complaintId,
            'status' => $status,
            'type' => $complaintType,
            'complainant_name' => $complainantName,
            'created_at' => $createdAtValue,
        ];
    }

    $appointmentComplaintPool = array_merge(
        $seeded['complaints'],
        fetchRows(
            $conn,
            "SELECT id, type, complainant_name, created_at, status
             FROM complaints
             ORDER BY id DESC
             LIMIT 40"
        )
    );

    for ($i = 0; $i < $appointmentCount; $i++) {
        $seed = $i + 1;
        $status = $appointmentStatuses[$i];
        $complaint = pick($appointmentComplaintPool, $i, $appointmentComplaintPool[0]);
        $complaintId = (string) $complaint['id'];
        $complaintLabel = $complaint['type'] ?? 'Complaint';
        $complainantName = $complaint['complainant_name'] ?? 'Resident';

        $scheduledBase = match ($status) {
            'scheduled' => $now->add(new DateInterval('P' . (($seed % 12) + 1) . 'D')),
            'rescheduled' => $now->add(new DateInterval('P' . (($seed % 10) + 3) . 'D')),
            'completed' => $now->sub(new DateInterval('P' . (($seed % 12) + 1) . 'D')),
            'cancelled' => $now->sub(new DateInterval('P' . (($seed % 8) + 1) . 'D')),
            'no-show' => $now->sub(new DateInterval('P' . (($seed % 6) + 1) . 'D')),
            default => $now->add(new DateInterval('P2D')),
        };

        $hour = 8 + ($seed % 8);
        $minute = ($seed % 2) === 0 ? 0 : 30;
        $scheduledAt = $scheduledBase->setTime($hour, $minute);
        $createdAt = $scheduledAt->sub(new DateInterval('P' . (($seed % 5) + 1) . 'D'));
        $updatedAt = $status === 'scheduled'
            ? $createdAt
            : $scheduledAt->add(new DateInterval('PT2H'));

        $title = pick(['Barangay Mediation Hearing', 'Follow-up Conference', 'Settlement Conference'], $seed);
        $description = sprintf('%s appointment for %s', $complaintLabel, $complainantName);
        $referenceType = 'App\\Models\\Complaint';
        $scheduledAtValue = $scheduledAt->format('Y-m-d H:i:s');
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');

        $insertAppointment->bind_param(
            str_repeat('s', 8),
            $referenceType,
            $complaintId,
            $title,
            $description,
            $scheduledAtValue,
            $status,
            $createdAtValue,
            $updatedAtValue
        );
        $insertAppointment->execute();

        $appointmentId = (int) $insertAppointment->insert_id;
        $seeded['appointments'][] = [
            'id' => $appointmentId,
            'complaint_id' => $complaintId,
            'status' => $status,
            'scheduled_at' => $scheduledAtValue,
        ];
    }

    $bidSequence = nextReferenceSequence($conn, 'barangay_id_requests');
    $bidStatuses = $documentStatuses($barangayIdCount);
    for ($i = 0; $i < $barangayIdCount; $i++) {
        $seed = $beforeCounts['barangay_id_requests'] + $i + 1;
        $status = $bidStatuses[$i];
        $purok = pick($purokRows, $seed);
        $street = pick($streetsByPurok[(int) $purok['id']] ?? $streetRows, $seed);
        $fullName = pick($complainantNames, $seed) . ' ' . pick(['Cruz', 'Santos', 'Lopez', 'Rivera'], $seed + 1);
        $gender = pick($genders, $seed);
        $age = (string) (20 + ($seed % 38));
        $referenceNumber = sprintf('BID-%d-%05d', $year, $bidSequence++);
        $contactNumber = '09' . str_pad((string) (400000000 + $seed), 9, '0', STR_PAD_LEFT);
        $dob = $now->sub(new DateInterval('P' . ((int) $age) . 'Y'))->sub(new DateInterval('P' . (($seed % 240) + 10) . 'D'))->format('Y-m-d');
        $civilStatus = pick($civilStatuses, $seed);
        $email = 'bid.demo.' . $seed . '@demo.local';
        $purokZone = str_replace('Purok ', 'Purok/Zone ', $purok['name']);
        $streetAddress = sprintf('House %d, %s', ($seed % 140) + 1, $street['name']);
        $emergencyName = pick(['Ana Reyes', 'Leo Cruz', 'Mila Torres', 'Paul Santos'], $seed);
        $emergencyNumber = '09' . str_pad((string) (500000000 + $seed), 9, '0', STR_PAD_LEFT);
        $bloodType = pick($bloodTypes, $seed);
        $validIdPath = pick($bidFilePaths, $seed, $bidFilePaths[0] ?? null);
        $createdAt = $now->sub(new DateInterval('P' . (($seed % 12) + 1) . 'D'));
        $updatedAt = $status === 'Pending' ? $createdAt : $createdAt->add(new DateInterval('P' . (($seed % 3) + 1) . 'D'));
        $paymentStatus = $seed % 3 === 0 ? 'Pending' : 'Paid';
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');

        $insertBarangayId->bind_param(
            str_repeat('s', 18),
            $fullName,
            $gender,
            $age,
            $referenceNumber,
            $contactNumber,
            $dob,
            $civilStatus,
            $email,
            $purokZone,
            $streetAddress,
            $emergencyName,
            $emergencyNumber,
            $bloodType,
            $validIdPath,
            $createdAtValue,
            $updatedAtValue,
            $status,
            $paymentStatus
        );
        $insertBarangayId->execute();
        $seeded['documents'][] = ['reference_number' => $referenceNumber, 'status' => $status, 'type' => 'Barangay ID'];
    }

    $coiSequence = nextReferenceSequence($conn, 'coi_requests');
    $coiStatuses = $documentStatuses($coiCount);
    for ($i = 0; $i < $coiCount; $i++) {
        $seed = $beforeCounts['coi_requests'] + $i + 1;
        $status = $coiStatuses[$i];
        $purok = pick($purokRows, $seed + 2);
        $street = pick($streetsByPurok[(int) $purok['id']] ?? $streetRows, $seed + 2);
        $fullName = pick($respondentNames, $seed) . ' ' . pick(['Mendoza', 'Garcia', 'Fernandez', 'Lopez'], $seed + 2);
        $referenceNumber = sprintf('COI-%d-%05d', $year, $coiSequence++);
        $contactNumber = '09' . str_pad((string) (600000000 + $seed), 9, '0', STR_PAD_LEFT);
        $age = (string) (19 + ($seed % 35));
        $dob = $now->sub(new DateInterval('P' . ((int) $age) . 'Y'))->sub(new DateInterval('P' . (($seed % 180) + 10) . 'D'))->format('Y-m-d');
        $civilStatus = pick($civilStatuses, $seed);
        $email = 'coi.demo.' . $seed . '@demo.local';
        $purokZone = str_replace('Purok ', 'Purok/Zone ', $purok['name']);
        $streetAddress = sprintf('House %d, %s', ($seed % 100) + 11, $street['name']);
        $purpose = pick($purposeOptions, $seed);
        $specificPurpose = $purpose === 'Scholarship' ? 'Academic subsidy requirement' : 'Community processing request';
        $uploadPath = pick($coiFilePaths, $seed, $coiFilePaths[0] ?? null);
        $createdAt = $now->sub(new DateInterval('P' . (($seed % 10) + 1) . 'D'));
        $updatedAt = $status === 'Pending' ? $createdAt : $createdAt->add(new DateInterval('P' . (($seed % 4) + 1) . 'D'));
        $paymentStatus = $seed % 4 === 0 ? 'Paid' : 'Pending';
        $gender = pick($genders, $seed);
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');

        $insertCoi->bind_param(
            str_repeat('s', 17),
            $fullName,
            $referenceNumber,
            $contactNumber,
            $dob,
            $civilStatus,
            $email,
            $purokZone,
            $streetAddress,
            $purpose,
            $specificPurpose,
            $uploadPath,
            $createdAtValue,
            $updatedAtValue,
            $status,
            $paymentStatus,
            $gender,
            $age
        );
        $insertCoi->execute();
        $seeded['documents'][] = ['reference_number' => $referenceNumber, 'status' => $status, 'type' => 'Certificate of Indigency'];
    }

    $corSequence = nextReferenceSequence($conn, 'cor_requests');
    $corStatuses = $documentStatuses($corCount);
    for ($i = 0; $i < $corCount; $i++) {
        $seed = $beforeCounts['cor_requests'] + $i + 1;
        $status = $corStatuses[$i];
        $purok = pick($purokRows, $seed + 4);
        $street = pick($streetsByPurok[(int) $purok['id']] ?? $streetRows, $seed + 4);
        $fullName = pick($complainantNames, $seed + 1) . ' ' . pick(['Navarro', 'Morales', 'Torres', 'Bautista'], $seed + 3);
        $gender = pick($genders, $seed + 1);
        $age = (string) (18 + ($seed % 42));
        $referenceNumber = sprintf('COR-%d-%05d', $year, $corSequence++);
        $contactNumber = '09' . str_pad((string) (700000000 + $seed), 9, '0', STR_PAD_LEFT);
        $dob = $now->sub(new DateInterval('P' . ((int) $age) . 'Y'))->sub(new DateInterval('P' . (($seed % 220) + 10) . 'D'))->format('Y-m-d');
        $civilStatus = pick($civilStatuses, $seed + 1);
        $email = 'cor.demo.' . $seed . '@demo.local';
        $purokZone = str_replace('Purok ', 'Purok/Zone ', $purok['name']);
        $streetAddress = sprintf('House %d, %s', ($seed % 120) + 20, $street['name']);
        $purpose = pick($purposeOptions, $seed + 1);
        $yearsOfResidency = (string) (($seed % 12) + 1);
        $createdAt = $now->sub(new DateInterval('P' . (($seed % 9) + 1) . 'D'));
        $updatedAt = $status === 'Pending' ? $createdAt : $createdAt->add(new DateInterval('P' . (($seed % 3) + 1) . 'D'));
        $paymentStatus = $seed % 2 === 0 ? 'Paid' : 'Pending';
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');
        $uploadedFile = null;

        $insertCor->bind_param(
            str_repeat('s', 17),
            $fullName,
            $gender,
            $age,
            $referenceNumber,
            $contactNumber,
            $dob,
            $civilStatus,
            $email,
            $purokZone,
            $streetAddress,
            $purpose,
            $yearsOfResidency,
            $uploadedFile,
            $createdAtValue,
            $updatedAtValue,
            $status,
            $paymentStatus
        );
        $insertCor->execute();
        $seeded['documents'][] = ['reference_number' => $referenceNumber, 'status' => $status, 'type' => 'Certificate of Residency'];
    }

    $notificationSources = array_merge(
        $seeded['complaints'],
        $seeded['incidents'],
        $seeded['appointments'],
        $seeded['documents']
    );

    for ($i = 0; $i < $notificationCount; $i++) {
        $source = pick($notificationSources, $i, []);
        $type = nextNotificationType($notificationTypes, $i);
        $userId = (string) pick(array_merge($adminIds, $residentUserIds), $i, $primaryAdminId);
        $createdAt = $now->sub(new DateInterval('P' . (($i % 14) + 1) . 'D'))->add(new DateInterval('PT' . (($i % 10) + 1) . 'H'));
        $readAt = $i % 4 === 0 ? $createdAt->add(new DateInterval('PT2H'))->format('Y-m-d H:i:s') : null;
        $createdAtValue = $createdAt->format('Y-m-d H:i:s');

        $message = match ($type) {
            'incident_reported' => 'New incident reports were added to the response queue.',
            'complaint_status_updated' => 'A complaint status has been updated in the mediation queue.',
            'appointment_scheduled' => 'New mediation appointments were scheduled for review.',
            'document_request_submitted' => 'Additional document requests were received for processing.',
            'registration_pending' => 'New resident registrations were submitted for verification.',
            default => 'System notification',
        };

        $data = json_encode([
            'id' => $source['id'] ?? null,
            'status' => $source['status'] ?? null,
            'reference_number' => $source['reference_number'] ?? null,
            'complaint_id' => $source['complaint_id'] ?? ($source['id'] ?? null),
            'description' => $source['type'] ?? $source['location'] ?? null,
        ], JSON_UNESCAPED_SLASHES);

        $insertNotification->bind_param(
            str_repeat('s', 6),
            $userId,
            $type,
            $message,
            $data,
            $readAt,
            $createdAtValue
        );
        $insertNotification->execute();
    }

    $conn->commit();
} catch (Throwable $throwable) {
    $conn->rollback();
    fwrite(STDERR, "Seeder failed: " . $throwable->getMessage() . "\n");
    exit(1);
}

$afterCounts = snapshotCounts($conn);

echo json_encode([
    'inserted' => [
        'incidents' => $incidentCount,
        'complaints' => $complaintCount,
        'appointments' => $appointmentCount,
        'barangay_id_requests' => $barangayIdCount,
        'coi_requests' => $coiCount,
        'cor_requests' => $corCount,
        'notifications' => $notificationCount,
    ],
    'totals_before' => $beforeCounts,
    'totals_after' => $afterCounts,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
