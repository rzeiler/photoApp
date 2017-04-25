var myApp = angular.module('photoApp', ['ngRoute', 'ngSanitize', 'ngAnimate']);

myApp.service('APIInterceptor', ['$q', '$location', function($q, $location) {
    var service = this;
    service.response = function(response) {
        if (typeof response.data === 'string') {
            if (response.data.indexOf('name="signForm"') > 1) {
                $('body').addClass('signForm');
            } else {
                $('body').removeClass('signForm');
            }
        }
        $('.button-collapse').sideNav('hide');
        var msg = response.data.message;
        if (msg) {
            if (msg == 'unknown') {
                $location.path("/signin");
            }
        }
        return response;
    };
    service.responseError = function(response) {
        Materialize.toast(response, 4000);
        return response;
    };
}]);
/* Define Routing for app */
myApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/album.html',
        controller: 'albumController'
    }).when('/photo/:id/:newload?', {
        templateUrl: 'views/photo.html',
        controller: 'photoController'
    }).when('/:page/:id/edit/:pid', {
        templateUrl: 'views/edit.html',
        controller: 'editController'
    }).when('/user', {
        templateUrl: 'views/user.html',
        controller: 'userController'
    }).when('/show/:id/:pid', {
        templateUrl: 'views/show.html',
        controller: 'showController'
    }).when('/signin', {
        templateUrl: 'views/signin.html',
        controller: 'signinController'
    }).otherwise({
        templateUrl: 'views/album.html',
        controller: 'albumController'
    });
    $httpProvider.interceptors.push('APIInterceptor');
    $httpProvider.defaults = {
        headers: {
            'Accept': 'application/json, text/plain',
            'Content-Type': 'application/json'
        },
    };
}]);
myApp.directive('loading', ['$http', '$q', function($http, $q) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.isLoading = function() {
                return $http.pendingRequests.length > 0;
            };
            scope.$watch(scope.isLoading, function(value) {
                if (value) {
                    element.removeClass('ng-hide');
                } else {
                    element.addClass('ng-hide');

                }
            });
        }
    };
}]);
