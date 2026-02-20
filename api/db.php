<?php
$conn = new mysqli("localhost","root","","cyblab");

if($conn->connect_error){
 die("DB error");
}
?>
