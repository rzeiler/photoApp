$(document).bind('openSignin', function() {
  $("main").load("views/signin.html", function() {
    $("#signForm").submit(function(event) {
      $.getJSON('tph.php', {
        action: 'signin',
        email: $('#email').val(),
        password: $('#password').val()
      }, function(result) {
        if (result.message == 'know') {
          window.email = result.email;
          window.name = result.name;
          window.picture = result.picture;
          routie('album');
        } else {
          Materialize.toast('User unknow!', 4000);
        }
      });
      event.preventDefault();
    });

  });
});
