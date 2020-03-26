<?php
//Choose JS file to run
$file = './src/app.js';
//Spawn node server in the background and return its pid
$pid = exec('PORT=9000 node/bin/node ' . $file . ' >/dev/null 2>&1 & echo $!');
//Wait for node to start up
usleep(500000);
//Connect to node server using cURL
$curl = curl_init('http://127.0.0.1:9000/');
curl_setopt($curl, CURLOPT_HEADER, 1);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
//Get the full response
$resp = curl_exec($curl);
if($resp === false) {
    //If couldn't connect, try increasing usleep
    echo 'Error: ' . curl_error($curl);
} else {
    //Split response headers and body
    list($head, $body) = explode("\r\n\r\n", $resp, 2);
    $headarr = explode("\n", $head);
    //Print headers
    foreach($headarr as $headval) {
        header($headval);
    }
    //Print body
    echo $body;
}
//Close connection
curl_close($curl);
//Close node server
exec('kill ' . $pid);