myApp.controller('showController', ['$scope', '$sce', '$http', '$routeParams', '$location', '$timeout',  function($scope, $sce, $http, $routeParams, $location) {
    $('nav.white').addClass('z-depth-0');
    $('div.navbar-fixed nav').hide();
    var liIndex = 0;
    var atIndex = 0;
    $http.post('tph.php', {
        action: 'get_pictures',
        id: $routeParams.id
    }).then(function(response) {
        $scope.pictures = response.data.pictures;
        $scope.$parent.pageTitle = response.data.title;
    });
    $scope.init = function init(id) {
        liIndex++;
        if (id == $routeParams.pid) {
            atIndex = liIndex;
        }
        if (liIndex >= $scope.pictures.length) {
            setTimeout(function() {
                $('.slider').slider({
                    full_width: true,
                    indicators: true,
                    Interval: 50
                });
                $("ul.indicators").hide();
                $("ul.indicators li.indicator-item:eq(" + (atIndex - 1) + ")").trigger("click");
                $('div.slider > div.progress').hide();
                setForward();
            }, 10);
        }
    };

    function setBreak() {
        $('.slider').slider('pause');
        $('i.play').text('play_circle_outline');
        $('i.pause').text('pause_circle_filled');
    }

    function setForward() {
        $('.slider').slider('start');
        $('i.play').text('play_circle_filled');
        $('i.pause').text('pause_circle_outline');
    }
    /* actions */
    $scope.play = function play() {
        setForward();
    };
    $scope.pause = function pause() {
        setBreak();
    };
    $scope.next = function next() {
        setBreak();
        $('.slider').slider('next');
    };
    $scope.prev = function prev() {
        setBreak();
        $('.slider').slider('prev');
    };
    $scope.exit = function exit() {
        setBreak();
        $location.path("/photo/" + $routeParams.id);
    };
    $scope.edit = function edit() {
        setBreak();
        var id = $("ul.slides>li.active>img").data('id');
        $location.path("/photo/" + $routeParams.id + "/edit/" + id);
    };
}]);
