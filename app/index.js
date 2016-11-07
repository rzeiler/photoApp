 myApp.controller('appController',['$scope','$sce', '$http', '$routeParams', '$location',  function($scope, $sce, $http, $routeParams, $location) {
     $scope.openUser = function() {
         $location.path("user");
     };
     $scope.index = {};
     $scope.index.links = [];
     $scope.index.btns = [];
     $scope.index.title = "...";
     $scope.index.showCollapse = true;
     $http.post('tph.php', {
         action: 'get_user',
         limit: 1
     }).then(function(response) {
         if (response.data.message === null) {
             $scope.index.email = response.data.user.email;
             $scope.index.name = response.data.user.name;
             $scope.index.src = response.data.user.picture;
         }
     });
 }]);
