<?php
  header('Content-Type: application/json; charset=utf-8');
  session_start();
  $date = new DateTime();
  $postdata = file_get_contents('php://input');

$request = (object) $_GET;

  $ini = parse_ini_file('db.ini');
  $arr = array();
  $arr = array_merge($arr, array('message' => $request->action));

  // error_reporting(E_ALL);
  // ini_set('display_errors', '1');

  /* http://www.w3schools.com/php/php_mysql_select.asp */
  if (isset($request->action)) {
      /* connection */
      $conn = new mysqli($ini['servername'], $ini['usr'], $ini['pwd'], $ini['dbname']);
      if ($conn->connect_error) {
          die('Connection failed: '.$conn->connect_error);
      }
      if (!$conn->set_charset('utf8')) {
          printf("Error loading character set utf8: %s\n", $conn->error);
          exit();
      }
      if (isset($_SESSION['user'])) {
          $user = $_SESSION['user'];
          /* add folder */
          if ($request->action == 'add_folder' && isset($request->title) && isset($request->detail)) {
              $sql = "INSERT INTO folders (title, detail, owner) VALUES ('$request->title', '$request->detail', $user)";
              if ($conn->query($sql) === true) {
                  $arr = array_merge($arr, array('message' => 'New album created successfully'));
              /* add access */
              $folderId = $conn->insert_id;
                  foreach ($request->access as $item) {
                      $sql = "INSERT INTO access (account,folder) VALUES ($item,$folderId);";
                      $conn->query($sql);
                  }
              } else {
                  $arr = array_merge($arr, array('message' => 'Error: '.$conn->error));
              }
          }
          if($request->action == 'set_folder_title' && isset($request->title) && isset($request->id)){
            $sql = "UPDATE folders SET title='$request->title' WHERE id=$request->id;";
            if ($conn->query($sql) === true) {
              $arr = array_merge($arr, array('title' => $request->title, 'message' => 'Save title successfully!'));
            }
          }
          /* add folder */
          if ($request->action == 'set_folder' && isset($request->title) && isset($request->detail) && isset($request->id)) {
              $sql = "UPDATE folders SET title='$request->title', detail='$request->detail' WHERE id=$request->id;";
              if ($conn->query($sql) === true) {
                  $arr = array_merge($arr, array('message' => 'Album successfully changed.'));
                  /* add access */
                  $folderId = $conn->insert_id;
                  $sql = "DELETE FROM access  WHERE folder=$folderId;";
                  $conn->query($sql);
                  if (isset($request->access)) {
                      foreach ($request->access as $item) {
                          $sql = "INSERT INTO access (account,folder) VALUES ($item,$folderId);";
                          $conn->query($sql);
                      }
                  }
              } else {
                  $arr = array_merge($arr, array('message' => 'Error: '.$conn->error));
              }
          }
          if ($request->action == 'remove_folder' && isset($request->id)) {
              $sql = "DELETE FROM folders  WHERE if=$request->id;";
              if ($conn->query($sql) === true) {
                  $arr = array_merge($arr, array('message' => 'Error: '.$conn->error));
              } else {
                  $arr = array_merge($arr, array('message' => 'Error: '.$conn->error));
              }
          }
          /* set user */
          if ($request->action == 'set_user' && isset($request->name) && isset($request->email) && isset($request->picture)) {
              $sql = "UPDATE account SET email='$request->email', name='$request->name', picture='$request->picture' WHERE id=".$_SESSION['user'].';';
              if ($conn->query($sql) === true) {
                  $arr = array_merge($arr, array('message' => 'Account successfully changed.'));
              } else {
                  $arr = array_merge($arr, array('message' => 'Error: '.$conn->error));
              }
          }
          if ($request->action == 'set_user' && isset($request->password)) {
              $sql = "UPDATE account SET password='$request->password' WHERE id=".$_SESSION['user'].';';
              if ($conn->query($sql) === true) {
                  $arr = array_merge($arr, array('message' => 'Account successfully changed.'));
              } else {
                  $arr = array_merge($arr, array('message' => 'Error: '.$conn->error));
              }
          }
          /* get user */
          if ($request->action == 'get_user' && isset($request->limit)) {
              $tmp = array();
              $sql = "SELECT id, name, IFNULL(picture,'images/yuna.jpg') AS picture, email FROM account WHERE id=".$_SESSION['user'].' GROUP BY name;';
              $result = $conn->query($sql);
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      $tmp = $row;
                  }
              }
              $arr = array_merge($arr, array('user' => $tmp));
              unset($tmp);
              /* get images */
              $tmp = array();
              $sql = 'SELECT p.id, extension, p.title FROM picture AS p LEFT JOIN folders AS f ON f.id=p.folder_id '.
              " WHERE f.owner=$user OR $user IN (SELECT a.account FROM access AS a WHERE a.folder=f.id AND a.account=$user) ORDER BY p.id LIMIT $request->limit";
              $result = $conn->query($sql);
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      array_push($tmp,  array('src' => 'photo/'.$row['id'].'.'.$row['extension'], 'title' => $row['title'], 'id' => $row['id'], 'extension' => $row['extension']));
                  }
              }
              $arr = array_merge($arr, array('pictures' => $tmp));
              unset($tmp);
          }
          /* get folders */
          if ($request->action == 'get_folders' || $request->action == 'add_folder') {
              $arr = array('name' => $_SESSION['mail']);
              $sql = " SELECT f.id, f.title, f.detail, f.owner, IFNULL(CONCAT(p.id,'.',p.extension),'0.jpg') AS image FROM ".
            ' folders AS f LEFT JOIN picture AS p ON f.id=p.folder_id WHERE f.owner='.$user.' or '.$user.' IN (SELECT a.account FROM access AS a WHERE a.folder=f.id AND a.account='.$user.') '.
            ' GROUP BY f.id';
              $result = $conn->query($sql);
              $tmp = array();
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      array_push($tmp,  array('id' => $row['id'], 'detail' => $row['detail'], 'title' => $row['title'], 'src' => 'photo/'.$row['image']));
                  }
              }
              $arr = array_merge($arr, array('folders' => $tmp));
              unset($tmp);
              $tmp = array();
              $sql = 'SELECT id, name FROM account GROUP BY name;';
              $result = $conn->query($sql);
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      array_push($tmp, array('id' => $row['id'], 'name' => $row['name']));
                  }
                  $key = array_search($user, array_column($tmp, 'id'));
                  if ($key) {
                      $tmp[$key]['selected'] = 'selected';
                      $tmp[$key]['disabled'] = 'disabled';
                  }
              }
              $arr = array_merge($arr, array('users' => $tmp));
              unset($tmp);
          }
          /* get picture */
          if ($request->action == 'get_picture' && isset($request->id)) {
              $sql = " SELECT p.id, p.title, p.date, mime_type, folder_id, extension FROM picture AS p LEFT JOIN folders AS f ON f.id=p.folder_id WHERE p.id=$request->id AND f.owner=$user OR $user IN (SELECT a.account FROM access AS a WHERE a.folder=f.id AND a.account=$user) ORDER BY p.id ";
              $result = $conn->query($sql);
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      $tmp = array('src' => 'photo/'.$row['id'].'.'.$row['extension'], 'title' => $row['title'], 'id' => $row['id'], 'extension' => $row['extension'], 'folder' => $row['folder_id'], 'mime_type' => $row['mime_type']);
                  }
              }
              $arr = array_merge($arr, array('photo' => $tmp));
              unset($tmp);
          }

          /* get package */
          if ($request->action == 'get_package' && isset($request->id)) {
              $zip = new ZipArchive();
              $zipname = '/'.session_id().'.zip';
              $res = $zip->open(__DIR__.$zipname, ZipArchive::CREATE);
              if ($res === true) {
                  $sql = " SELECT p.id, p.title, p.date, mime_type, folder_id, extension FROM picture AS p LEFT JOIN folders AS f ON f.id=p.folder_id WHERE removed=0 AND folder_id=$request->id AND f.owner=$user OR $user IN (SELECT a.account FROM access AS a WHERE a.folder=f.id AND a.account=$user) ORDER BY p.id ";
                  $result = $conn->query($sql);
                  if ($result->num_rows > 0) {
                      while ($row = $result->fetch_assoc()) {
                          $zip->addFile(__DIR__.'/photo/'.$row['id'].'.'.$row['extension'], $row['title'].'.'.$row['extension']);
                      }
                  }
                  $arr = array_merge($arr, array('package' => $zipname));
                  $zip->close();
              } else {
                  $arr = array_merge($arr, array('error' => " no zip $res"));
              }
              unset($tmp);
          }

          /* remove_picture */
          if ($request->action == 'remove_picture' && isset($request->id) && isset($request->path)) {
              $sql = "DELETE FROM picture WHERE id=$request->id AND account_id=$user;";
              $result = $conn->query($sql);
              try {
                  if (unlink($request->path)) {
                      $arr = array_merge($arr, array('removed_picture' => $conn->affected_rows, 'id' => "card$request->id"));
                  } else {
                      $arr = array_merge($arr, array('removed_picture' => $conn->affected_rows, 'error' => 'could not delete picture from server!', 'id' => "card$request->id"));
                  }
              } catch (Exception $e) {
                  $arr = array_merge($arr, array('error' => $e));
              }
          }
          /* get pictures */
          if ($request->action == 'get_pictures' && isset($request->id)) {
              $sql = " SELECT p.id, p.title, p.date, mime_type, folder_id, extension FROM picture AS p LEFT JOIN folders AS f ON f.id=p.folder_id WHERE removed=0 AND folder_id=$request->id AND f.owner=$user OR $user IN (SELECT a.account FROM access AS a WHERE a.folder=f.id AND a.account=$user) ORDER BY p.id ";
              $tmp = array();
              $result = $conn->query($sql);
              $align = ['center-align', 'left-align', 'right-align', 'center-align'];
              $alignIndex = 0;
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      array_push($tmp,  array('src' => 'photo/'.$row['id'].'.'.$row['extension'], 'title' => $row['title'], 'id' => $row['id'], 'cssclass' => $align[$alignIndex]));
                      ++$alignIndex;
                      if ($alignIndex > 2) {
                          $alignIndex = 0;
                      }
                  }
              }
              $arr = array_merge($arr, array('pictures' => $tmp));
              unset($tmp);
              $sql = "SELECT f.id, f.title, f.detail, a.name, f.owner FROM folders AS f LEFT JOIN account AS a ON f.owner=a.id WHERE f.id=$request->id";
              $tmp = array();
              $result = $conn->query($sql);
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      $tmp = array('id' => $row['id'], 'title' => $row['title'], 'detail' => $row['detail'], 'name' => $row['name'], 'allowEdit' => ($row['owner']==$user) ? true:false);
                  }
              }
              $arr = array_merge($arr, array('folder' => $tmp));
              unset($tmp);
              $tmp = array();
              $sql = "SELECT a.id, name, b.folder FROM account AS a LEFT JOIN access AS b ON b.account=a.id AND b.folder=$request->id GROUP BY name";
              $result = $conn->query($sql);
              if ($result->num_rows > 0) {
                  while ($row = $result->fetch_assoc()) {
                      array_push($tmp, array('id' => $row['id'], 'name' => $row['name']));
                      $key = array_search($row['id'], array_column($tmp, 'id'));
                      if ($key) {
                          $tmp[$key]['selected'] = 'selected';
                      }
                  }
              }
              $arr = array_merge($arr, array('users' => $tmp));
              unset($tmp);
          }
      } else {
          $arr = array('message' => 'unknown');
      }
      if ($request->action == 'signin' && isset($request->email) && isset($request->password)) {
          $sql = "SELECT id, email, picture, name FROM account WHERE email='".$request->email."' AND password='".$request->password."' ;";
          $result = $conn->query($sql);
          if ($result->num_rows > 0) {
              while ($row = $result->fetch_assoc()) {
                  $_SESSION['user'] = $row['id'];
                  $_SESSION['mail'] = $row['email'];
                  $arr = array('id' => $row['id'], 'message' => 'know', 'name' => $row['name'], 'picture' => $row['picture'], 'email' => $row['email']);
              }
          }
      }
      /* close */
      $conn->close();
      echo json_encode($arr);
  } else {
      echo json_encode(array('message' => 'no action'));
  }
