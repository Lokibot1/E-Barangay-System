<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // allow React frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Database connection
$servername = "localhost";
$username = "root"; // your MySQL username
$password = "";     // your MySQL password
$dbname = "barangay_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Get resident ID from query parameter
$resident_id = intval($_GET['id'] ?? 0);

if ($resident_id > 0) {
    $sql = "SELECT id, first_name, middle_name, last_name, birthdate, contact_number, email, temp_purok_id 
            FROM residents 
            WHERE id = $resident_id LIMIT 1";

    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode($row);
    } else {
        echo json_encode(null); // no resident found
    }
} else {
    echo json_encode(['error' => 'Invalid resident ID']);
}

$conn->close();
?>
