var canvas;
var data;
myApp.controller('editController',  ['$scope', '$sce', '$http', '$routeParams', '$location', function($scope, $sce, $http, $routeParams, $location) {
    $('nav.white').addClass('z-depth-0');
    $('div.navbar-fixed nav').show();
    $('div#nav').removeClass('navbar-fixed');
    var backurl;
    if ($routeParams.page == 'photo') {
        backurl = $routeParams.page + "/" + $routeParams.id;
    } else {
        backurl = $routeParams.page + "/" + $routeParams.id + "/" + $routeParams.pid;
    }
    $scope.index.title = 'Edit';
    btns = [{
        'target': 'modalDelete',
        'title': 'Delete'
    } ];
    $scope.index.btns = btns;
    links = [{
        'url': '#/' + backurl,
        'class': ' ',
        'title': 'Back'
    }, {
        'class': 'save_click',
        'title': 'Save'
    }];
    $scope.index.links = links;
    $http.post('tph.php', {
        action: 'get_picture',
        id: $routeParams.pid
    }).then(function(response) {
        $scope.picture = response.data.photo;
        $('#Image').ImageWorker({
            filter: $('a.filter'),
            thunbs: $('ul#filters a.filter'),
            adjust: $('input.adjust'),
            src: $scope.picture.src
        });
        $('ul.tabs').tabs();
        $('.modal-trigger').modal({
            dismissible: false,
            ready: function() {
                return true;
            }
        });
        $("ul#filters").mousewheel(function(event, delta) {
            this.scrollLeft -= (delta * 30);
            event.preventDefault();
        });
        $('.save_click').click(function(e) {
            var ncanvas = document.getElementById('Image');
            if (ncanvas) {
                var base64 = ncanvas.toDataURL('image/jpeg', 1);
                $.ajax({
                    method: "POST",
                    url: "upload.php",
                    contentType: 'application/x-www-form-urlencoded',
                    data: {
                        folder: $scope.picture.folder,
                        id: $scope.picture.id,
                        type: $scope.picture.mime_type,
                        ext: $scope.picture.extension,
                        name: $scope.picture.title,
                        base64: base64
                    }
                }).done(function(json) {
                    $('.button-collapse').sideNav('hide');
                    $location.path(backurl);
                    $scope.$apply();
                    Materialize.toast('Success!', 4000);
                });
            }
        });

        $('.delete_click').click(function(e) {
            $('.button-collapse').sideNav('hide');
            $.ajax({
                method: "POST",
                url: "tph.php",
                data: {
                    action: 'remove_picture',
                    id: $routeParams.pid
                }
            }).done(function(json) {
                if (json.message == 'signin') {
                    $location.path("/signin");
                }
                Materialize.toast('Deleted!', 4000);
                $location.path(backurl);
                $scope.$apply();
            });
            return false;
        });
    });
}]);
