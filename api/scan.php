header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

<?php
header("Content-Type: application/json");

include "db.php";
include "utils.php";

$data = json_decode(file_get_contents("php://input"), true);

if(!isset($data["url"])){
 echo json_encode(["error"=>"no url"]);
 exit;
}

$url = $data["url"];

$result = analyze_url($url);

$stmt = $conn->prepare("INSERT INTO scans(url,risk,result) VALUES(?,?,?)");

$json = json_encode($result);

$stmt->bind_param("sis",$url,$result["risk"],$json);
$stmt->execute();

echo json_encode($result);
