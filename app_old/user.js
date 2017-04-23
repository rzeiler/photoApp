/* default */
myApp.controller('userController', ['$scope', '$sce', '$http', '$routeParams', '$location', '$timeout', function($scope, $sce, $http, $routeParams, $location, $timeout) {
    $('nav.white').addClass('z-depth-0');
    $('div.navbar-fixed nav').show();
    $('div#nav').addClass('navbar-fixed');
    $scope.index.title = "Account";
    $scope.index.showCollapse = true;
    var links = [{
        'url': '#/album',
        'class': '',
        'title': 'Album',
    }];
    $scope.index.links = links;
    $scope.index.btns = [];
    $http.post('tph.php', {
        action: 'get_user',
        limit: 50
    }).then(function(response) {
        $scope.email = response.data.user.email;
        $scope.name = response.data.user.name;
        $scope.src = response.data.user.picture;
        $scope.pictures = response.data.pictures;
        $timeout(function() {
            Materialize.updateTextFields();
            $('input').characterCounter();
            $('.modal').modal();
            $('.chips').material_chip();
        }, 10);
    });
    $scope.check = function() {
        if ($scope.pwdcompare == $scope.pwd) {
            $scope.userForm.$invalid = false;
        } else {
            $scope.userForm.$invalid = true;
        }
    };
    $scope.set = function(src) {
        $scope.src = src;
    };
    $scope.save = function() {
        $scope.index.email = $scope.email;
        $scope.index.name = $scope.name;
        $scope.index.src = $scope.src;
            $http.post('tph.php', {
            action: 'set_user',
            name: $scope.name,
            email: $scope.email,
            picture: $scope.src,
            password: $scope.pwd
        }).then(function(response) {
            Materialize.toast(response.data.message, 4000);
        });
    };
}]);
