<?php

function analyze_url($url){

 $risk = 0;
 $flags = [];

 // panjang url
 if(strlen($url) > 75){
  $risk += 15;
  $flags[] = "URL too long";
 }

 // IP address
 if(preg_match('/\d+\.\d+\.\d+\.\d+/', $url)){
  $risk += 30;
  $flags[] = "Using IP address";
 }

 // banyak subdomain
 if(substr_count($url,'.') > 3){
  $risk += 15;
  $flags[] = "Too many subdomains";
 }

 // kata phishing
 $badWords = ["login","verify","secure","account","update"];

 foreach($badWords as $w){
  if(stripos($url,$w)!==false){
   $risk += 10;
   $flags[] = "Suspicious keyword: $w";
  }
 }

 if($risk>100) $risk=100;

 return [
  "risk"=>$risk,
  "flags"=>$flags
 ];
}
?>
