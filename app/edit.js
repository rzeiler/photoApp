$(document).bind('openEdit', function(e, album, bild) {
  $("main").load("views/edit.html", function() {

  
    $.getJSON('tph.php', {
      action: "get_picture",
      id: bild
    }, function(data) {


      $('#Image').ImageWorker({
        filter: $('a.filter'),
        thunbs: $('ul#filters a.filter'),
        adjust: $('input.adjust'),
        src: data.photo.src
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

    });



  });
});
