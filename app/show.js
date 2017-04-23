$(document).bind('openShow', function(e, album, id) {
  $('nav').hide();
  $("main").load("views/show.html", function() {
    $.getJSON('tph.php', {
      action: "get_pictures",
      id: album
    }, function(result) {
      data = result;
      console.log(data);
      if (data.message == "unknown") {
        routie('signin');
      }
      var row = $('#photos');
      $.each(data.pictures, function(i, v) {
        var li = $('<li><img src="' + v.src + '" /><div class="caption"><h6>' + v.title + '</h6></div></li>')
        $('.slides').append(li);
        if (id == v.id) {
          atIndex = i;
        }
      });
      $('.slider').slider({
        full_width: true,
        indicators: true,
        Interval: 50
      });
      $("ul.indicators").hide();
      $("ul.indicators li.indicator-item:eq(" + (atIndex - 1) + ")").trigger("click");
      $('div.slider > div.progress').hide();
      setForward();
    });

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
    $('#play').click(function() {
      setForward();
    });
    $('#pause').click(function() {
      setBreak();
    });
    $('#next').click(function() {
      setBreak();
      $('.slider').slider('next');
    });
    $('#prev').click(function() {
      setBreak();
      $('.slider').slider('prev');
    });
    $('#exit').click(function() {
      setBreak();
      $('nav').show();
      routie('photo/' + album);
    });
    $('#edit').click(function() {
      setBreak();
      $('nav').show();
      var id = $("ul.slides>li.active>img").data('id');
      routie('/photo/' + album + "/edit/" + id);
    });
  });
});
