 myApp.controller('signinController',  ['$scope', '$sce', '$http', '$routeParams', '$location', function($scope, $sce, $http, $routeParams, $location) {
     $('nav.white').addClass('z-depth-0');
     $('div.navbar-fixed nav').show();
     $('div#nav').addClass('navbar-fixed');
     $scope.index.title = "Sign in";
     $scope.$parent.links = [];
     $scope.$parent.btns = [];
     $scope.index.showCollapse = false;
     $scope.signin = function() {
         $http.post('tph.php', {
             action: 'signin',
             email: $scope.email,
             password: $scope.pwd
         }).then(function(response) {
             if (response.data.message == 'know') {
                 $scope.index.email = response.data.email;
                 $scope.index.name = response.data.name;
                 $scope.index.src = response.data.picture;
                 $location.path("/");
             } else {
                 Materialize.toast('User unknow!', 4000);
             }
         }, function(response) {
             Materialize.toast(response, 4000);
         });
     };
 }]);
