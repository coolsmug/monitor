let open = document.getElementsByClassName("list_one");

let lastClickeding = null;

for(let i = 0; i < open.length; i++) {
    open[i].onclick = function() {
        // Toggle the "actives" class on the clicked element
        this.classList.toggle("active");

        // Find the next sibling element
        let hideit = this.nextElementSibling;

        // Close the last clicked element if it exists and is not the current element
        if (lastClickeding && lastClickeding !== this) {
            lastClickeding.nextElementSibling.style.maxHeight = null;
            lastClickeding.nextElementSibling.style.opacity = '0';
            lastClickeding.classList.remove("active");
        }

        // Set the maxHeight of the clicked element's next sibling
        if (hideit.style.maxHeight) {
            hideit.style.maxHeight = null;
            hideit.style.opacity = '0';
        } else {
            hideit.style.maxHeight = hideit.scrollHeight + "px";
            hideit.style.opacity = '1';
        }

        // Set the last clicked element to the current element
        lastClickeding = this;
    }
}


// for table hidden deyails-----------------------------------------------------------------------------//

let acc = document.getElementsByClassName("butn");

let lastClickeds = null;

for(let a = 0; a <  acc.length; a++) {
    acc[a].addEventListener("click", function() {
        // Toggle the "actives" class on the clicked element
        this.classList.toggle("active");

        // Find the next sibling element
        let hideit = this.nextElementSibling;

        // Close the last clicked element if it exists and is not the current element
        if (lastClickeds && lastClickeds !== this) {
            lastClickeds.nextElementSibling.style.visibility = "hidden";
            lastClickeds.nextElementSibling.style.opacity = '0';
            lastClickeds.classList.remove("active");
        }

        // Toggle the visibility of the clicked element's next sibling
        if (hideit.style.visibility === "visible") {
            hideit.style.visibility = "hidden";
            hideit.style.opacity = '0';
        } else {
            hideit.style.visibility = "visible";
            hideit.style.opacity = '1';
        }

        // Set the last clicked element to the current element
        lastClickeds = this;
    });
}



// ==?? Update session ??????????????????????????/////

$("#update-section").submit(function (sect) {
  sect.preventDefault();

  let unindexed_arrayssss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrayssss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/update-section/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert("Section Updated Successfully!")
    location.reload();
   
  });
});

$("#update-third-section").submit(function (sect) {
  sect.preventDefault();

  let unindexed_arrayssss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrayssss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/update-third/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert("Section Updated Successfully!")
    location.reload();
    console.log("Section Updated Successfully!")
  });
});

//  class Ajax for Updating and deleting \\\\\\\\\\\\\\\\\\\\\\\\//

$("#edit-posts").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/update-currentclass/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert("Current class Updated Successfully!")
    location.reload()
    
  });
});


// switch button

$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');
      var row = $(this).closest('tr');

      isProcessing = true;

      $.ajax({
        url: `/admin/user-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
          row.remove();
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.switch').click(debouncedClickHandler);
});


$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('staff-id');
      const updatedStatus = $(this).find('input').is(':checked');
      var row = $(this).closest('tr');

      isProcessing = true;

      $.ajax({
        url: `/admin/staff-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
          row.remove();
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.switcher').click(debouncedClickHandler);
});




$("#pull_out").submit(function (params) {
  params.preventDefault();

  let unindexed_arrays = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrays, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  let request = {
    "url" : `/admin/update-proprietor/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

  $.ajax(request).done(function (response) {
    alert("Session Updated Successfully!")
    location.reload();
    
  });
});


$("#school").submit(function (params) {
  params.preventDefault();

  let unindexed_arrays = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrays, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  let request = {
    "url" : `/admin/update-school/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

  $.ajax(request).done(function (response) {
    alert("Session Updated Successfully!")
    location.reload();
    
  });
});


$("#pull_off").submit(function (params) {
  params.preventDefault();

  let unindexed_arrays = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrays, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  let request = {
    "url" : `/admin/update-session/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

  $.ajax(request).done(function (response) {
    alert("Session Updated Successfully!")
    location.reload();
    
  });
});


$("#edit-state").submit(function (params) {
  params.preventDefault();

  let unindexed_arrays = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrays, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  let request = {
    "url" : `/admin/update-staff-statement/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

  $.ajax(request).done(function (response) {
    alert("Session Updated Successfully!")
    location.reload();
    
  });
});

$("#edit-subject").submit(function (params) {
  params.preventDefault();

  let unindexed_arrays = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrays, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  let request = {
    "url" : `/admin/update-subject/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

  $.ajax(request).done(function (response) {
    alert("Session Updated Successfully!")
    location.reload();
    
  });
});


$("#update_user").submit(function (eventss) {
  eventss.preventDefault();

  var unindexed_array = $(this).serializeArray();
  var data = {};

  $.map(unindexed_array, function (n, i) {
    data[n["name"]] = n["value"];
  });

  console.log(data);
    // var id = $(form).attr("data-id");
  var request = {
    "url": `/admin/update-learner/${data.id}`,
    "method": "POST",
    "data": data,
    
  };

  $.ajax(request).done(function (response) {
    alert("Data Updated Successfully!");
    location.reload();

  });
});


const copyBtnss = document.querySelectorAll('.copy-btn');

function copyText(event) {
  const row = event.target.closest('tr');
  const text = row.querySelector('.avis').textContent;

  // Use navigator.clipboard API if available and on a secure context
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert(`${text} copied!`))
      .catch(err => {
        console.error('Unable to copy text: ', err);
        fallbackCopyText(text);
      });
  } else {
    // Fallback for unsupported browsers or insecure contexts
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  alert(`${text} copied!`);
}

copyBtnss.forEach(btn => {
  btn.addEventListener('click', copyText);
});


// =================Code for delete learner=========================//

// $(function() {
//   $('a.delete_learner').click(function(e) {
//     e.preventDefault(); // Prevent the default behavior of the anchor tag
//     var url = $(this).attr('href'); // Get the URL to send the DELETE request to
//     var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
//     var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

//     if (confirm('Are you sure you want to delete this data?')) {
//       $.ajax({
//         url: url,
//         type: 'DELETE',
//         data: { id: id },
//         success: function(result) {
//           alert('Data deleted successfully!');
//           row.remove(); // Remove the deleted row from the DOM
//         },
//         error: function(xhr, status, error) {
//           alert('Error deleting Data: ' + error);
//         }
//       });
//     }
//   });
// });


//

let closesing = document.getElementById("tii");
let opening = document.getElementById("shii")
let oneNOW = document.getElementById("big-door")

function closIts() {
  closesing.onclick = ()=> {
      oneNOW.style.left = '-1000px'
      oneNOW.style.transition = 'all .7s ease-in-out'
      oneNOW.style.opacity = "0"
     
  }
}
closIts()

function openIt() {
  opening.onclick = ()=> {
      oneNOW.style.left = '0px'
      oneNOW.style.transition = 'all .7s ease-in-out'
      oneNOW.style.opacity = "1"
  }
}
openIt()


//for all school setting

$(function() {
  $('a.deleteOne').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr');
   // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});

$(function() {
  $('a.deleteTwo').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr');
   // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


$(function() {
  $('a.deleteThree').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr');
   // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});

$(function() {
  $('a.staffClasses').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr');
   // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to remove this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


//all section delete

$(function() 
{$('a.deleteSection').click(function(e) {
  e.preventDefault(); // Prevent the default behavior of the anchor tag
  var url = $(this).attr('href'); // Get the URL to send the DELETE request to
  var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
  var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

  if (confirm('Are you sure you want to delete this data?')) {
    $.ajax({
      url: url,
      type: 'DELETE',
      data: { id: id },
      success: function(result) {
        alert('Data deleted successfully!');
        row.remove(); // Remove the deleted row from the DOM
      },
      error: function(xhr, status, error) {
        alert('Error deleting Data: ' + error);
      }
    });
  }
});
});

$(function() {
  $('a.deleteSession').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
})

$(function() {
  $('a.deleteSubject').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});

$(function() {
  $('a.deleteThird').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});





// =================Code for delete learner=========================//

$(function() {
  $('a.deleteOldLearner').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


//for Switch Past Learner
$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');
      var row = $(this).closest('tr');

      isProcessing = true;

      $.ajax({
        url: `/admin/olduser-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
          row.remove();
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.switch').click(debouncedClickHandler);
});



//delete to true

$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('learner-id');
      const updatedStatus = $(this).find('input').is(':checked');
      var row = $(this).closest('tr');

      isProcessing = true;

      $.ajax({
        url: `/admin/delete-learner/${switchId}`,
        type: 'PATCH',
        data: { deletes: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Learners Deleted Succesfully');
          row.remove();
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.switching').click(debouncedClickHandler);
});


//switch school
$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');
      var row = $(this).closest('tr');

      isProcessing = true;

      $.ajax({
        url: `/admin/school-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          $('#customPopup').show();
        row.remove();
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.switch').click(debouncedClickHandler);
});



//Miscellaneous 
$("#update_usersMille").submit(function (eventss) {
  eventss.preventDefault();

  var unindexed_array = $(this).serializeArray();
  var data = {};

  $.map(unindexed_array, function (n, i) {
    data[n["name"]] = n["value"];
  });

  console.log(data);
    
  var request = {
    "url": `/staff/update_miscellaneous/${data.id}`,
    "method": "POST",
    "data": data,
    
  };

  $.ajax(request).done(function (response) {
    alert("Data Updated Successfully!");
    location.reload();
    console.log("Data Updated Successfully!");
  });
});


//Create staff
$("#creat-Classing").submit(function (params) {
  params.preventDefault();

  let unindexed_arrays = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrays, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  let request = {
    "url" : `/admin/update-staff/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

  $.ajax(request).done(function (response) {
    alert("Session Updated Successfully!")
    location.reload();
    
  });
});


//third term Exam fill

$("#update_misc").submit(function (eventss) {
 eventss.preventDefault();

 var unindexed_array = $(this).serializeArray();
 var data = {};

 $.map(unindexed_array, function (n, i) {
   data[n["name"]] = n["value"];
 });

 console.log(data);
   // var id = $(form).attr("data-id");
 var request = {
   "url": `/staff/register_miscellaneous`,
   "method": "POST",
   "data": data,
   
 };

 $.ajax(request).done(function (response) {
   alert("Data Updated Successfully!");
   location.reload();
   console.log("Data Updated Successfully!");
 });
});

// CBT
$(".question").submit(function (sect) {
  sect.preventDefault();

  let unindexed_arrayssss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arrayssss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/update-questions-page/${data.id}`,
    "method" : "PUT",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert("Section Updated Successfully!")
    location.reload();
    console.log("Question Updated Successfully!")
  });
});


$(function() {
  $('a.question').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('div'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


$(".test-form").submit(function (event) {
  event.preventDefault();

  let unindexedArray = $(this).serializeArray();
  let data = {};

  $.map(unindexedArray, function (n, i) {
    data[n["name"]] = n["value"];
  });
  console.log(data);

  var request = {
    "url": `/admin/update-tests-page/${data.id}`,
    "method": "PUT",
    "data": data,
  };

  $.ajax(request).done(function(response) {
    alert("Section Updated Successfully!");
    location.reload();
    console.log("Question Updated Successfully!");
  });
});



$(function() {
  $('a.test').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('div'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


