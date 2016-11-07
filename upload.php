<?php
  header('Content-Type: application/json; charset=utf-8');
  session_start();
  $date = new DateTime();
  $ini = parse_ini_file("db.ini");
  $data = array();
  if (isset($_SESSION["user"])) {
      if (isset($_POST['base64']) && isset($_POST['type']) && isset($_POST['name']) && isset($_POST['ext']) && isset($_POST['folder'])) {
          $conn = new mysqli($ini['servername'], $ini['usr'], $ini['pwd'], $ini['dbname']);
          if ($conn->connect_error) {
              die("Connection failed: " . $conn->connect_error);
          }
          // if (!$conn->set_charset("utf8")) {
          //     printf("Error loading character set utf8: %s\n", $conn->error);
          //     exit();
          // }
          $img = $_POST['base64'];
          $img = str_replace('data:'. $_POST['type'] .';base64,', '', $img);
          $img = str_replace(' ', '+', $img);
          $fileData = base64_decode($img);
          $sql = "INSERT INTO picture (title, mime_type, folder_id, extension, account_id, public) VALUES".
          " ('".$_POST['name']."','".$_POST['type']."',".$_POST['folder'].",'".$_POST['ext']."',".$_SESSION["user"].",false);";
          $id = null;
          if ($conn->query($sql) === true) {
              $id = $conn->insert_id;
              $data = array_merge($data, array('message' => 'New images saved successfully'));
          } else {
              $data = array_merge($data, array('message' => 'Error: '. $conn->error));
          }
          if ($id != null) {
              $uploaddir = "photo/". $id . "." .  $_POST['ext'];
              if (file_put_contents($uploaddir, $fileData)) {
                  $data = array('pictures' => array('src' => 'photo/'.$id.'.'.$_POST['ext'], 'title' => $_POST['name'], 'id' => $id));
              } else {
                  $data = array('error' => 'file_put_contents wrong.' . $uploaddir) ;
              }
          } else {
              $data = array('error' => 'Insert wrong. No id!') ;
          }
          if (isset($_POST['id'])) {
              $sql = "UPDATE picture SET removed=1 WHERE id=".$_POST['id'].";";
              if ($conn->query($sql) === true) {
                  $data = array_merge($data, array('message' => 'New album created successfully'));
              } else {
                  $data = array_merge($data, array('message' => 'Error: '. $conn->error));
              }
          }
          $conn->close();
      }
  }
   echo json_encode($data);
