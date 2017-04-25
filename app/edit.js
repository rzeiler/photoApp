$(document).bind('openEdit', function(e, album, bild) {
	$("main").load("views/edit.html", function() {
		var canvasId = "#canvas";
		$('.brand-logo').text('Edit');
		Caman.Filter.register("oldpaper", function() {
			this.pinhole();
			this.noise(10);
			this.orangePeel();
			this.render();
		});
		Caman.Filter.register("pleasant", function() {
			this.colorize(60, 105, 218, 10);
			this.contrast(10);
			this.sunrise();
			this.hazyDays();
			this.render();
		});
		$('ul#filters a.filter').each(function() {
			var a = $(this);
			var thunbnail = $('<img/>');
			thunbnail.attr('src', 'images/' + a.data('filter') + '.png');
			a.append(thunbnail);
		});
		$.getJSON('tph.php', {
			action: "get_picture",
			id: bild
		}, function(data) {
			var _Caman = Caman(canvasId, data.photo.src, function() {
				$('.logview').height($(canvasId).outerHeight());
				$('.logview').append("<span>Image loaded</span>");
			});
			Caman.Event.listen("processStart", function(job) {
				$('.logview').append("<span>Start:" + job.name + "</span>");
			});
			Caman.Event.listen(_Caman, "renderFinished", function(job) {
				$('.logview').tappendext("<span>Finished:" + job.name + "</span>");
			});
			Caman.Event.listen("processComplete", function(job) {
				$('.logview').append("<span>Finished:" + job.name + "</span>");
			});
			$('ul.tabs.opt').tabs();
			var li = '<li><a class="grey-text" >Save<i class="material-icons right">save</i></a></li>';
			$('.more-opt').html(li);
			$(document).on('click', 'a.filter', function() {
				var af = $(this);
				var orginalText = af.html();
				af.html('Rendering...');
				var effect = $.trim($(this).data('filter'));
				var value = $.trim($(this).data('value'));
				Caman(canvasId, data.photo.src, function() {
					if(effect in this) {
						this[effect](value);
						this.render(function() {
							console.log("ok");
							af.html(orginalText);
						});
					}
				});
			});
			$(document).on('change', 'input.adjust', function() {
				var effect = $.trim($(this).data('filter'));
				var value = $.trim($(this).val());
				Caman(canvasId, data.photo.src, function() {
					var _Caman = this;
					_Caman.revert(false);
					$('input.adjust').each(function() {
						var effect = $.trim($(this).data('filter'));
						var value = $.trim($(this).val());
						if(effect in _Caman) {
							_Caman[effect](value);
						}
					});
					_Caman.render(function() {
						console.log("ok");
					});
				});
			});
			$("ul#filters").mousewheel(function(event, delta) {
				this.scrollLeft -= (delta * 30);
				event.preventDefault();
			});
		});
	});
});
