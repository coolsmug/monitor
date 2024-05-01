document.addEventListener('DOMContentLoaded', function () {
    var clickOn = document.querySelector('.pressIt');
    var allErrors = document.querySelector('.coverup');
  
    var removeModalss = function (event) {
      event.preventDefault();
      if (allErrors) {
        allErrors.style.display = 'none';
      }
    };
  
    if (clickOn) {
      clickOn.addEventListener('click', removeModalss);
    }
  });
  

