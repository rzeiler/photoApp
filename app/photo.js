var max_width = 3000;
var max_height = 2000;
var ListCanvas = [];
var preview;
var files;
var folder;
var inpFile;
var locSco;

var folder_data;
myApp.controller('photoController', ['$scope', '$sce', '$http', '$routeParams', '$location', '$timeout', function($scope, $sce, $http, $routeParams, $location, $timeout) {
    locSco = $scope;
    folder = $routeParams.id;
    $('nav.white').addClass('z-depth-0');
    $('div.navbar-fixed nav').show();
    $('div#nav').addClass('navbar-fixed');
    links = [{
        'url': '#/album',
        'class': '',
        'title': 'Back',
        'icon': 'chevron_left'
    }];
    $scope.index.links = links;
    btns = [{
        'target': 'modalAlbum',
        'title': 'Edit',
        'icon': 'mode_edit'
    }];
    $scope.index.btns = btns;
    $scope.parentobj = {};
    $scope.parentobj.folder = {};
    $scope.parentobj.folder.id = $routeParams.id;
    /* modal */
    $scope.templateUrl = 'views/album_form.html';
    /* get data  */
    $http.post('tph.php', {
        action: 'get_pictures',
        id: $scope.parentobj.folder.id
    }).then(function(response) {
        if (response.data.folder) {
            folder_data = response.data;
            $scope.pictures = response.data.pictures;
            $scope.parentobj.users = response.data.users;
            $scope.parentobj.name = response.data.folder.name;
            $scope.index.title = response.data.folder.title;
            $scope.parentobj.folder.title = response.data.folder.title;
            $scope.parentobj.folder.detail = response.data.folder.detail;
        }
    });
    $scope.open = function open(arg) {
        $location.path("/show/" + $scope.parentobj.folder.id + "/" + arg);
    };

    inpFile = document.querySelector("input#file");
    preview = document.querySelector('#preview');
    $scope.add = function add() {
        $(inpFile).trigger('click');
    };
    inpFile.addEventListener('change', function(e) {
        setTimeout(function() {
            $('#modal1').modal('open');
            files = inpFile.files;
            for (var i = 0; i < files.length; i++) {
                readAndPreview(files[i]);
            }
        }, 100);
    });
}]);

function ScaleImage(img) {
    $('p.info').text('Scale Image');
    var can = document.createElement("canvas");
    var nH = img.naturalHeight;
    var nW = img.naturalWidth;
    var ph = (nH > max_height) ? max_height / nH : 1;
    var pw = (nW > max_width) ? max_width / nW : 1;
    var p = (pw > ph) ? pw : ph;
    can.width = nW * p;
    can.height = nH * p;
    var ctx = can.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, nW, nH, 0, 0, nW * p, nH * p);
    ListCanvas.push(can);
    var w = ListCanvas.length / files.length * 100;
    $('div.determinate').css('width', w + '%');
    $('p.info').text((files.length == ListCanvas.length) ? 'Bild bearbeitung fertig.' : 'Bild wird bearbeitet...');
    if (w == 100) {
        len = ListCanvas.length;
        for (var a = 0; a < len; a++) {
            var canvas = ListCanvas[a];
            var file = files[a];
            var base64 = canvas.toDataURL(file.type, 0.3);
            $.ajax({
                method: "POST",
                url: "upload.php",
                contentType: 'application/x-www-form-urlencoded',
                data: {
                    name: file.name,
                    type: file.type,
                    base64: base64,
                    folder: folder,
                    ext: file.name.split('.').pop().toLowerCase()
                }
            }).done(function(msg) {
                var data = locSco.pictures;
                data.push(msg.pictures);
                locSco.pictures = data;
                locSco.$apply();
                Materialize.toast('Success!', 4000);
                if (len == a) {
                    inpFile.value = '';
                    ListCanvas = [];
                    files = null;
                    setTimeout(function() {
                        $('#modal1').modal('close');
                    }, 1000);
                }
            });
        }
    }
}

function readAndPreview(file) {
    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var image = new Image();
            image.height = 100;
            image.title = file.name;
            image.src = this.result;
            preview.appendChild(image);
            ScaleImage(image);
        }, false);
        reader.readAsDataURL(file);
    }
}
