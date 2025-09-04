$(function() {
  var form = $('#contact-form');
  var formMessages = $('.form-message');

  $(form).submit(function(e) {
    e.preventDefault();

    var formData = $(form).serialize();

    $.ajax({
      type: 'POST',
      url: $(form).attr('action'), // now points to /send-email
      data: formData
    })
    .done(function(response) {
      $(formMessages).removeClass('error').addClass('success');
      $(formMessages).text(response.message || "Message sent successfully!");
      $('#contact-form input, #contact-form textarea').val('');
    })
    .fail(function(xhr) {
      $(formMessages).removeClass('success').addClass('error');

      if (xhr.responseJSON && xhr.responseJSON.error) {
        $(formMessages).text(xhr.responseJSON.error);
      } else {
        $(formMessages).text('Oops! ' + xhr.status + ' - ' + xhr.statusText);
      }
    });
  });
});
