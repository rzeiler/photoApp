var max_width = 3000;
var max_height = 2000;
var ListCanvas = [];
var preview;
var files;
var folder;
var inpFile;
var locSco;
var folder_data;

$(document).bind('openPhoto', function(e, albumid) {
  $("main").load("views/photo.html", function() {
    $('.modal').modal();
    $.get("views/album_card.html", function(card) {
      var data;
      $.getJSON('tph.php', {
        action: "get_pictures",
        id: albumid
      }, function(result) {
        data = result;
        console.log(data);
        if (data.message == "unknown") {
          routie('signin');
        }
        var row = $('#photos');
        window.users = data.users;
        $('.brand-logo').text(data.folder.title);
        $.each(data.pictures, function(i, v) {
          var _card = $(card);
          _card.find('img').attr('src', v.src);
          _card.attr('id', 'card' + v.id);
          _card.find('.card-title').text(v.title);
          _card.find('.open').click(function() {
            routie('photo/' + albumid + "/show/" + $(this).data('id'));
          }).data('id', v.id);
          _card.find('.delete').click(function() {
            var id = $(this).data('id'),
              src = $(this).data('src');
            var ok = confirm("Delete, You are sure?");
            if (ok) {
              $.getJSON('tph.php', {
                action: "remove_picture",
                id: id,
                path: src
              }, function(json) {
                if (json.removed_picture) {
                  if (json.removed_picture == 1) {
                    $('#' + json.id).hide();
                  }
                }
                if (json.error) {
                  Materialize.toast(json.error, 6000);
                } else {
                  Materialize.toast('Deleted!', 4000);
                }
                if (json.message == 'signin') {
                  $location.path("/signin");
                }
              }, function errorCallback(response) {
                console.log(response);
              });
            }
          }).data('id', v.id).data('src', v.src);
          _card.find('.edit').click(function() {
            routie('photo/' + albumid + "/edit/" + $(this).data('id'));
          }).data('id', v.id);
          row.append(_card);
        });
      });
    });


    inpFile = document.querySelector("input#file");
    preview = document.querySelector('#preview');
    $('#add').click(function() {
      $(inpFile).trigger('click');
      $('#modal1').modal('open');
    });
    inpFile.addEventListener('change', function(e) {

      files = inpFile.files;
      for (var i = 0; i < files.length; i++) {
        readAndPreview(files[i]);
      }

    });


    function ScaleImage(img) {
      $('p.info').text('Scale Image');
      var can = document.createElement("canvas");
      var nH = img.naturalHeight;
      var nW = img.naturalWidth;
      // var ph = (nH > max_height) ? max_height / nH : 1;
      // var pw = (nW > max_width) ? max_width / nW : 1;
      // var p = (pw > ph) ? pw : ph;
      // can.width = nW * p;
      // can.height = nH * p;
      can.width = nW;
      can.height = nH;
      var ctx = can.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, nW, nH, 0, 0, nW, nH);
      ListCanvas.push(can);
      var w = ListCanvas.length / files.length * 100;
      $('div.determinate').css('width', w + '%');
      $('p.info').text((files.length == ListCanvas.length) ? 'Bild bearbeitung fertig.' : 'Bild wird bearbeitet...');
      if (w == 100) {
        len = ListCanvas.length;
        for (var a = 0; a < len; a++) {
          var canvas = ListCanvas[a];
          var file = files[a];
          var base64 = canvas.toDataURL(file.type, .7);
          $.ajax({
            method: "POST",
            url: "upload.php",
            contentType: 'application/x-www-form-urlencoded',
            data: {
              name: file.name,
              type: file.type,
              base64: base64,
              folder: albumid,
              ext: file.name.split('.').pop().toLowerCase()
            }
          }).done(function(msg) {
            Materialize.toast('Success!', 4000);
            $('#modal1').modal('close');
             $(document).triggerHandler('openPhoto', [albumid]);
          });
        }
      }
    }

    function readAndPreview(file) {
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.height = 100;
          img.title = file.name;
          img.src = reader.result;
          img.onload = function() {
            ScaleImage(img);
          }
          preview.appendChild(img);
        }
        reader.readAsDataURL(file);
        // var reader = new FileReader();
        // reader.addEventListener("load", function() {
        //   var image = new Image();
        //   image.height = 100;
        //   image.title = file.name;
        //   image.src = this.result;
        //   preview.appendChild(image);
        //   //ScaleImage(image);
        // }, false);
        // reader.readAsDataURL(file);
      }
    }
  });
});
