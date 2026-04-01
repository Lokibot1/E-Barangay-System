<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script can only run from the command line.\n");
    exit(1);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$options = getopt('', ['count::']);
$count = isset($options['count']) ? max(1, (int) $options['count']) : 48;

$conn = new mysqli('localhost', 'root', '', 'bgd');
$conn->set_charset('utf8mb4');

function fetchFirstColumn(mysqli $conn, string $sql): array
{
    $result = $conn->query($sql);
    $values = [];
    while ($row = $result->fetch_row()) {
        $values[] = $row[0];
    }
    return $values;
}

function fetchRows(mysqli $conn, string $sql): array
{
    $result = $conn->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    return $rows;
}

function buildStatusPool(int $count): array
{
    $distribution = [
        'Pending' => max(1, (int) round($count * 0.38)),
        'For Verification' => max(1, (int) round($count * 0.29)),
        'Verified' => max(1, (int) round($count * 0.21)),
        'Rejected' => max(1, (int) round($count * 0.12)),
    ];

    $pool = [];
    foreach ($distribution as $status => $qty) {
        for ($i = 0; $i < $qty; $i++) {
            $pool[] = $status;
        }
    }

    while (count($pool) < $count) {
        $pool[] = 'Pending';
    }

    return array_slice($pool, 0, $count);
}

function pick(array $values, int $index, $fallback = null)
{
    if ($values === []) {
        return $fallback;
    }
    return $values[$index % count($values)];
}

$adminIds = fetchFirstColumn($conn, "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC");
$verifiedBy = $adminIds[0] ?? null;
$reviewedBy = $adminIds[1] ?? $verifiedBy;

$purokIds = fetchFirstColumn($conn, "SELECT id FROM puroks ORDER BY id ASC");
$streetRows = fetchRows($conn, "SELECT id, purok_id FROM streets ORDER BY id ASC");
$maritalIds = fetchFirstColumn($conn, "SELECT id FROM marital_statuses ORDER BY id ASC");
$sectorIds = fetchFirstColumn($conn, "SELECT id FROM sectors WHERE is_active = 1 ORDER BY id ASC");
$nationalityId = (int) (fetchFirstColumn($conn, "SELECT id FROM nationalities ORDER BY id ASC LIMIT 1")[0] ?? 1);
$photoPairs = fetchRows(
    $conn,
    "SELECT id_front_path, id_back_path
     FROM residents
     WHERE id_front_path IS NOT NULL
       AND id_back_path IS NOT NULL
       AND id_front_path <> ''
       AND id_back_path <> ''
     ORDER BY id DESC
     LIMIT 10"
);

if ($purokIds === [] || $streetRows === [] || $photoPairs === []) {
    fwrite(STDERR, "Seeder could not find the required lookup/reference data.\n");
    exit(1);
}

$streetsByPurok = [];
foreach ($streetRows as $streetRow) {
    $streetsByPurok[(int) $streetRow['purok_id']][] = (int) $streetRow['id'];
}

$countsRow = $conn
    ->query(
        "SELECT
            COUNT(*) AS total,
            SUM(status = 'Pending') AS pending_count,
            SUM(status = 'For Verification') AS for_verification_count,
            SUM(status = 'Verified') AS verified_count,
            SUM(status = 'Rejected') AS rejected_count
         FROM residents
         WHERE deleted_at IS NULL"
    )
    ->fetch_assoc();

$residentBase = (int) ($countsRow['total'] ?? 0);
$barangayMaxRow = $conn
    ->query(
        "SELECT MAX(CAST(SUBSTRING_INDEX(barangay_id, '-', -1) AS UNSIGNED)) AS max_barangay
         FROM residents
         WHERE barangay_id IS NOT NULL
           AND barangay_id LIKE '26-%'"
    )
    ->fetch_assoc();
$barangaySequence = (int) ($barangayMaxRow['max_barangay'] ?? 0) + 1;

$firstNames = [
    'Aaron', 'Bea', 'Carlo', 'Diane', 'Ethan', 'Faith', 'Gian', 'Hazel',
    'Ivan', 'Jessa', 'Kyle', 'Lara', 'Miko', 'Nina', 'Owen', 'Paula',
    'Quinn', 'Rafael', 'Sofia', 'Tristan', 'Una', 'Vince', 'Wendy', 'Xian',
    'Yna', 'Zack', 'Alyssa', 'Bryan', 'Camille', 'Dominic', 'Elaine', 'Franz',
];
$middleNames = ['', 'Santos', 'Reyes', 'Cruz', 'Lopez', 'Garcia', 'Torres', 'Mendoza'];
$lastNames = [
    'Santos', 'Reyes', 'Cruz', 'Torres', 'Mendoza', 'Navarro', 'Flores', 'Dela Cruz',
    'Castro', 'Domingo', 'Morales', 'Villanueva', 'Lopez', 'Fernandez', 'Rivera', 'Bautista',
];
$suffixes = ['', '', '', 'Jr.', 'Sr.'];
$idTypes = ['National ID', 'Barangay ID', 'Driver License', 'Passport', 'PhilHealth ID'];
$positions = ['Head of Family', 'Spouse', 'Son', 'Daughter', 'Relative', 'Others'];
$rejectionReasons = [
    'Unreadable ID image',
    'Duplicate submission',
    'Incomplete address details',
    'Name mismatch on supporting ID',
];
$occupations = [
    'Store Crew', 'Delivery Rider', 'Cashier', 'Office Staff', 'Driver',
    'Teacher Aide', 'Service Crew', 'Freelancer', 'Vendor', 'Security Guard',
];
$schoolLevels = ['Elementary', 'Junior High School', 'Senior High School', 'College', 'Vocational'];
$statusPool = buildStatusPool($count);

$insertResident = $conn->prepare(
    "INSERT INTO residents (
        barangay_id,
        tracking_number,
        first_name,
        middle_name,
        last_name,
        suffix,
        birthdate,
        birth_registration,
        gender,
        contact_number,
        email,
        temp_house_number,
        temp_purok_id,
        temp_street_id,
        household_id,
        household_position,
        marital_status_id,
        nationality_id,
        sector_id,
        residency_status,
        residency_start_date,
        is_voter,
        id_type,
        id_front_path,
        id_back_path,
        status,
        visit_set_at,
        visit_set_by,
        rejection_reason,
        rejection_remarks,
        rejected_by,
        registration_payload,
        verified_at,
        verified_by,
        created_at,
        updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )"
);

$insertEmployment = $conn->prepare(
    "INSERT INTO employment_data (
        resident_id,
        employment_status,
        occupation,
        employer_name,
        work_address,
        business_name,
        business_type,
        business_status,
        income_source,
        monthly_income,
        income_bracket,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$insertEducation = $conn->prepare(
    "INSERT INTO education_data (
        resident_id,
        educational_status,
        school_type,
        school_level,
        school_name,
        course_program,
        highest_grade_completed,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$summary = [
    'Pending' => 0,
    'For Verification' => 0,
    'Verified' => 0,
    'Rejected' => 0,
];

$now = new DateTimeImmutable('now', new DateTimeZone('Asia/Manila'));

$conn->begin_transaction();

try {
    for ($i = 0; $i < $count; $i++) {
        $seed = $residentBase + $i + 1;
        $status = $statusPool[$i];
        $summary[$status]++;

        $firstName = pick($firstNames, $seed);
        $middleName = pick($middleNames, $seed + 3, '');
        $lastName = pick($lastNames, $seed + 5);
        $suffix = pick($suffixes, $seed + 7, '');
        $gender = $seed % 2 === 0 ? 'Male' : 'Female';

        $age = 21 + ($seed % 38);
        $birthdate = $now
            ->sub(new DateInterval('P' . $age . 'Y'))
            ->sub(new DateInterval('P' . (($seed % 320) + 10) . 'D'))
            ->format('Y-m-d');

        $purokId = (int) pick($purokIds, $seed, 1);
        $streetId = (int) pick($streetsByPurok[$purokId] ?? [1], $seed);
        $maritalId = (int) pick($maritalIds, $seed, 1);
        $sectorId = (int) pick($sectorIds, $seed + 2, 7);

        $createdAt = match ($status) {
            'Pending' => $now->sub(new DateInterval('P' . (($seed % 7) + 1) . 'D')),
            'For Verification' => $now->sub(new DateInterval('P' . (($seed % 14) + 4) . 'D')),
            'Verified' => $now->sub(new DateInterval('P' . (($seed % 30) + 10) . 'D')),
            'Rejected' => $now->sub(new DateInterval('P' . (($seed % 24) + 6) . 'D')),
            default => $now->sub(new DateInterval('P2D')),
        };

        $updatedAt = $createdAt->add(new DateInterval('PT' . (($seed % 10) + 1) . 'H'));
        $visitSetAt = null;
        $verifiedAt = null;
        $rejectionReason = null;
        $rejectionRemarks = null;
        $verifiedById = null;
        $rejectedById = null;
        $visitSetById = null;

        if ($status === 'For Verification') {
            $visitSetAt = $updatedAt->format('Y-m-d H:i:s');
            $visitSetById = $reviewedBy;
        } elseif ($status === 'Verified') {
            $verifiedAt = $updatedAt->format('Y-m-d H:i:s');
            $verifiedById = $verifiedBy;
        } elseif ($status === 'Rejected') {
            $rejectionReason = pick($rejectionReasons, $seed);
            $rejectionRemarks = 'Demo queue record seeded to populate the review list.';
            $rejectedById = $reviewedBy;
        }

        $trackingNumber = 'BGN9' . str_pad((string) $seed, 5, '0', STR_PAD_LEFT);
        $barangayId = $status === 'Pending'
            ? null
            : '26-' . str_pad((string) $barangaySequence++, 5, '0', STR_PAD_LEFT);
        $contactNumber = '09' . str_pad((string) (100000000 + $seed), 9, '0', STR_PAD_LEFT);
        $email = strtolower($firstName . '.' . $lastName . '.' . $seed . '@demo.local');
        $houseNumber = (string) (($seed % 180) + 1);
        $residencyStatus = $seed % 4 === 0 ? 'New Resident' : 'Old Resident';
        $residencyStartDate = $createdAt
            ->sub(new DateInterval('P' . (($seed % 1200) + 90) . 'D'))
            ->format('Y-m-d');
        $birthRegistration = $seed % 6 === 0 ? 'Not Registered' : 'Registered';
        $isVoter = $age >= 18 && $seed % 3 !== 0 ? 1 : 0;
        $idType = pick($idTypes, $seed);
        $photoPair = pick($photoPairs, $seed);
        $employmentStatus = $seed % 5 === 0 ? 'Self-Employed' : ($seed % 4 === 0 ? 'Unemployed' : 'Employed');
        $occupation = $employmentStatus === 'Unemployed' ? 'N/A' : pick($occupations, $seed);
        $monthlyIncome = $employmentStatus === 'Unemployed' ? '0' : (string) (12000 + (($seed % 8) * 3500));
        $incomeBracket = match (true) {
            (int) $monthlyIncome <= 10000 => 'Below 10,000',
            (int) $monthlyIncome <= 20000 => '10,000 - 20,000',
            (int) $monthlyIncome <= 30000 => '20,001 - 30,000',
            (int) $monthlyIncome <= 50000 => '30,001 - 50,000',
            default => 'Above 50,000',
        };
        $educationalStatus = $seed % 4 === 0 ? 'Currently Studying' : ($seed % 5 === 0 ? 'Not Studying' : 'Graduated');
        $schoolType = $educationalStatus === 'Not Studying' ? 'N/A' : ($seed % 2 === 0 ? 'Public' : 'Private');
        $schoolLevel = $educationalStatus === 'Not Studying' ? 'N/A' : pick($schoolLevels, $seed);
        $highestGrade = $educationalStatus === 'Currently Studying' ? 'Ongoing' : pick($schoolLevels, $seed + 2);

        $registrationPayload = json_encode([
            'tenure_status' => $seed % 2 === 0 ? 'Owned' : 'Rented',
            'wall_material' => $seed % 3 === 0 ? 'Concrete' : 'Wood',
            'roof_material' => $seed % 2 === 0 ? 'Metal' : 'Mixed',
            'water_source' => $seed % 4 === 0 ? 'Deep Well' : 'Water District',
            'number_of_families' => (string) (($seed % 3) + 1),
            'seeded_demo_record' => true,
        ], JSON_UNESCAPED_SLASHES);

        $createdAtValue = $createdAt->format('Y-m-d H:i:s');
        $updatedAtValue = $updatedAt->format('Y-m-d H:i:s');

        $householdId = null;
        $householdPosition = pick($positions, $seed);
        $frontPath = $photoPair['id_front_path'];
        $backPath = $photoPair['id_back_path'];

        $insertResident->bind_param(
            str_repeat('s', 36),
            $barangayId,
            $trackingNumber,
            $firstName,
            $middleName,
            $lastName,
            $suffix,
            $birthdate,
            $birthRegistration,
            $gender,
            $contactNumber,
            $email,
            $houseNumber,
            $purokId,
            $streetId,
            $householdId,
            $householdPosition,
            $maritalId,
            $nationalityId,
            $sectorId,
            $residencyStatus,
            $residencyStartDate,
            $isVoter,
            $idType,
            $frontPath,
            $backPath,
            $status,
            $visitSetAt,
            $visitSetById,
            $rejectionReason,
            $rejectionRemarks,
            $rejectedById,
            $registrationPayload,
            $verifiedAt,
            $verifiedById,
            $createdAtValue,
            $updatedAtValue
        );
        $insertResident->execute();

        $residentId = (int) $insertResident->insert_id;
        $employerName = $employmentStatus === 'Unemployed' ? null : 'Demo Employer ' . (($seed % 12) + 1);
        $workAddress = $employmentStatus === 'Unemployed' ? null : 'Brgy. Gulod, Purok ' . $purokId;
        $businessName = $employmentStatus === 'Self-Employed' ? 'Small Store ' . $residentId : null;
        $businessType = $employmentStatus === 'Self-Employed' ? 'Retail' : null;
        $businessStatus = $employmentStatus === 'Self-Employed' ? 'Business Owner' : 'N/A';
        $incomeSource = $employmentStatus === 'Self-Employed' ? 'Business' : ($employmentStatus === 'Unemployed' ? 'N/A' : 'Employment');

        $insertEmployment->bind_param(
            str_repeat('s', 13),
            $residentId,
            $employmentStatus,
            $occupation,
            $employerName,
            $workAddress,
            $businessName,
            $businessType,
            $businessStatus,
            $incomeSource,
            $monthlyIncome,
            $incomeBracket,
            $createdAtValue,
            $updatedAtValue
        );
        $insertEmployment->execute();

        $schoolName = $educationalStatus === 'Not Studying' ? null : 'Gulod Community School';
        $courseProgram = $schoolLevel === 'College' ? 'BS Information Technology' : null;
        $insertEducation->bind_param(
            str_repeat('s', 9),
            $residentId,
            $educationalStatus,
            $schoolType,
            $schoolLevel,
            $schoolName,
            $courseProgram,
            $highestGrade,
            $createdAtValue,
            $updatedAtValue
        );
        $insertEducation->execute();
    }

    $conn->commit();
} catch (Throwable $throwable) {
    $conn->rollback();
    fwrite(STDERR, "Seeder failed: " . $throwable->getMessage() . "\n");
    exit(1);
}

$updatedCounts = $conn
    ->query(
        "SELECT
            COUNT(*) AS total,
            SUM(status = 'Pending') AS pending_count,
            SUM(status = 'For Verification') AS for_verification_count,
            SUM(status = 'Verified') AS verified_count,
            SUM(status = 'Rejected') AS rejected_count
         FROM residents
         WHERE deleted_at IS NULL"
    )
    ->fetch_assoc();

echo json_encode([
    'inserted' => $count,
    'seeded_breakdown' => $summary,
    'totals_before' => $countsRow,
    'totals_after' => $updatedCounts,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
