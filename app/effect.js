(function($) {
    var caman = null;
    var img = null;
    /* https://github.com/meltingice/CamanJS-Plugins/tree/master/src */
    function setImage() {
        can = document.getElementById('Image');
        var dataUrl = can.toDataURL('image/jpeg', 1);
        $('div.workplace').css('background-image', 'url(' + dataUrl + ')');
    }
    $.fn.ImageWorker = function(options) {
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
        var settings = $.extend({
            max_height: 200,
            filter: null,
            thunbs: null,
            adjust: null,
            src: null
        }, options);
        o = this;
        o.on('load', function() {
          alert('asasd');
            img = this;
            caman = Caman(img);
            // Listen to all CamanJS instances
            Caman.Event.listen("processStart", function(job) {
                console.log("Start:", job.name);
                $('.preloader-text').text("Start:" + job.name);
                var oh = $(document).outerHeight();
                $('.preloader-holder').css('height', oh + 'px').show();
                $('body').css('overflow', 'hidden');
            });
            // Listen to a single instance only
            Caman.Event.listen(caman, "renderFinished", function(job) {
                console.log("Finished:", job.name);
                $('.preloader-text').text("Finished:" + job.name);
                $('.preloader-holder').hide();
                $('body').css('overflow', 'auto');
            });
            Caman.Event.listen("processComplete", function(job) {
                console.log("Finished:", job.name);
                $('.preloader-holder').hide();
                $('body').css('overflow', 'auto');
            });
            caman.domIsLoaded(function() {
                setImage();
                if (settings.thunbs) {
                    var org = document.getElementById('Image');
                    $.each(settings.thunbs, function() {
                        var a = $(this);
                        var thunbnail = $('<img/>');
                        thunbnail.attr('src', 'images/' + a.data('filter') + '.png');
                        a.append(thunbnail);
                    });
                    $('.preloader-holder').hide();
                }
            });
        });
        if (settings.filter) {
            settings.filter.click(function() {
                var effect = $.trim($(this).data('filter'));
                var value = $.trim($(this).data('value'));
                can = document.getElementById('Image');
                Caman(can, settings.src, function() {
                    if (effect in this) {
                        this[effect](value);
                        this.render(function() {
                            setImage();
                        });
                    }
                });
            });
        }
        if (settings.adjust) {
            /* create */
            settings.adjust.change(function() {
                var effect = $.trim($(this).data('filter'));
                var value = $.trim($(this).val());
                can = document.getElementById('Image');
                Caman(can, settings.src, function() {
                    var _Caman = this;
                    _Caman.revert(false);
                    settings.adjust.each(function() {
                        var effect = $.trim($(this).data('filter'));
                        var value = $.trim($(this).val());
                        if (effect in _Caman) {
                            _Caman[effect](value);
                        }
                    });
                    _Caman.render(function() {
                        setImage();
                    });
                });
            });
        }
    };
}(jQuery));
