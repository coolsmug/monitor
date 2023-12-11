
var clickOn= document.querySelector(".pressIt");
var allErrors = document.querySelector(".coverup");

var removeModalss =  function(event) {
    event.preventDefault()
    allErrors.style.display = "none"
}

clickOn.addEventListener("click", removeModalss);


// function myFunction(event) {
    
//     try {
//         var copyText = event.currentTarget.parentNode.nextElementSibling.innerHTML;
//          navigator.clipboard.writeText(copyText)
//          alert(`${copyText} copied!, press Ok to use it`)
//          console.log(copyText)
//     } catch (err) {
//         if(err) throw err
//         console.error(err)
//     }
   
//   };
  
//    const switchButton = 
//    document.getElementById('mySwitch');

//    switchButton.addEventListener('change', (event) => {
//     const switchStatus = event.currentTarget.checked;

    
//    })