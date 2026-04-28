<?php
$full_name = 'Juan Dela Cruz';
$reference_number = 'BID-2026-00113';
$documentType = 'Barangay ID';
$status = 'Verified';
ob_start();
include 'C:\\xampp\\htdocs\\DS-subsystem\\resources\\views\\emails\\document_status_updated.php';
echo ob_get_clean();
