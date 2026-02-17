<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // allow React app to fetch

// Database connection
$servername = "localhost";
$username = "root"; // your MySQL username
$password = "";     // your MySQL password
$dbname = "barangay_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Hardcoded resident_id = 15
$resident_id = 15;

// Prepare SQL query
$stmt = $conn->prepare("SELECT tracking_number, first_name FROM residents WHERE id = ?");
$stmt->bind_param("i", $resident_id);
$stmt->execute();
$result = $stmt->get_result();
$resident = $result->fetch_assoc();

if ($resident) {
    echo json_encode($resident); // returns {"tracking_number":"TRK-12345","first_name":"Juan"}
} else {
    echo json_encode(['error' => 'Resident not found']);
}

$stmt->close();
$conn->close();
?>
