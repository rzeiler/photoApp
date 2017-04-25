$(document).bind('openAlbum', function(e, a) {
   $('.more-opt').html("");
  $("main").load("views/album.html", function() {
    $('.modal').modal();
    $('select').material_select();
    Materialize.updateTextFields();

    $.get("views/album_card.html", function(card) {
      var data;
      $.getJSON('tph.php', {
        action: "get_folders",
        id: -1
      }, function(result) {
        data = result;
        if (data.message == "unknown") {
          routie('signin');
        }
        var row = $('#albums');
        window.users = data.users;
        $.each(data.folders, function(i, v) {
          var _card = $(card);
          _card.find('div.card').css('background-image', 'url(' + v.src + ')');
          _card.find('.card-title').text(v.title);
          $('.brand-logo').text('Album');
          _card.find('.open').click(function() {
            routie('photo/' + $(this).attr('id'));
          }).attr('id', v.id);
          _card.find('.delete').click(function() {
            $.getJSON('tph.php', {
              action: "remove_folder",
              id: $(this).attr('id')
            }, function(result) {
              console.log(result);
            });
          }).attr('id', v.id);
          _card.find('.edit').click(function() {
            var index = $(this).data('index');
            var item = data.folders[index];
            $('#albumModal').data('id', item.id);
            $('#albumModal').data('owner', item.owner);
            $('#albumModal #tit').val(item.title);
            $('#albumModal #des').val(item.detail);
            $('#albumModal #acc').html('');
            for (var i = 0; i < window.users.length; i++) {
              var user = window.users[i];
              $('#acc').append('<option value="' + user.id + '" ' + user.selected + ' ' + user.disabled + '>' + user.name + '</option>');
            }
            $('select').material_select();
            $('#albumModal h4').html('Edit <span class="teal lighten-2 badge white-text">Create by ' + window.name + '</span>')
            Materialize.updateTextFields();
            $('#albumModal').modal('open');
          }).data('index', i);
          row.append(_card);
        });
      });
    });
    /* save data */
    $('#albumModal .save').click(function() {
      var id = $('#albumModal').data('id');
      var access = $('#albumModal #acc').val();
      var action = 'set_folder';
      if (id == undefined) {
        action = 'add_folder';
      }
      $.getJSON('tph.php', {
        action: action,
        id: id,
        title: $('#albumModal #tit').val(),
        detail: $('#albumModal #des').val(),
        owner: $('#albumModal').data('owner'),
        access: access
      }, function(result) {
        Materialize.toast(result.message, 5000);
        $(document).triggerHandler('openAlbum');
      });
      $('#albumModal').removeData('id');
    })
  });
});
