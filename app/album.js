/* default */
myApp.controller('albumController', ['$scope', '$sce', '$http', '$routeParams', '$location', '$timeout', function($scope, $sce, $http, $routeParams, $location, $timeout) {
	$('nav.white').addClass('z-depth-0');
	$('div.navbar-fixed nav').show();
	$('div#nav').addClass('navbar-fixed');
	$scope.index.title = "Album";
	$scope.index.showCollapse = true;
	$scope.index.links = [];
	$scope.index.btns = [];
	/* modal */
	$scope.templateUrl = 'views/album_form.html';
	/* get alben */
	$scope.parentobj = {};
	$scope.parentobj.folder = {};
	$scope.parentobj.folder.id = -1;
	$http.post('tph.php', {
		action: 'get_folders',
		id: $scope.parentobj.folder.id
	}).then(function(response) {
		$scope.parentobj.albums = response.data.folders;
		$scope.owner = response.data.owner;
		$scope.ownerName = response.data.name;
		$scope.parentobj.users = response.data.users;
		$scope.parentobj.name = response.data.name;
	});
	$scope.open = function open(a, b) {
		$location.path("/photo/" + a);
	};
	$scope.edit = function(a, b) {
    $routeParams.id = a;
		alert("edit");
	};
}]);
/* modal */
myApp.controller('modalAlbumController', ['$scope', '$http', '$routeParams', '$timeout', function($scope, $http, $routeParams, $timeout) {
	var id = $routeParams.id;
	if(id === undefined) {
		id = -1;
		$scope.modalTitle = "New Album";
	} else {
		$scope.modalTitle = "Edit Album";
	}
	/* set select list */
	$scope.$watch('parentobj.users', function(newVal, oldVal) {
		if(newVal !== undefined) {
			$('#acc').html('');
			for(var i = 0; i < newVal.length; i++) {
				var user = newVal[i];
				$('#acc').append('<option value="' + user.id + '" ' + user.selected + ' ' + user.disabled + '>' + user.name + '</option>');
			}
			$scope.name = $scope.parentobj.name;
			$scope.tit = $scope.parentobj.folder.title;
			$scope.des = $scope.parentobj.folder.detail;
			$timeout(function() {
				$('.modal').modal();
				$('select').material_select();
				Materialize.updateTextFields();
			}, 0);
		}
	}, true);
	/* save  */
	$scope.save = function() {
		var access = $('#acc').val();
		var action = 'set_folder';
		if(id == -1) {
			action = 'add_folder';
		}
		$http.post('tph.php', {
			action: action,
			id: id,
			title: $scope.tit,
			detail: $scope.des,
			owner: $scope.owner,
			access: access
		}).then(function(response) {
			Materialize.updateTextFields();
			if(id == -1) {
				$scope.parentobj.albums = response.data.folders;
			}
			Materialize.toast(response.data.message, 2000);
		});
	};
}]);
