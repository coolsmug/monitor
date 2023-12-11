let open = document.getElementsByClassName("list_one");

let lastClicked = null;

for(let i = 0; i < open.length; i++) {
    open[i].onclick = function() {
        // Toggle the "actives" class on the clicked element
        this.classList.toggle("active");

        // Find the next sibling element
        let hideit = this.nextElementSibling;

        // Close the last clicked element if it exists and is not the current element
        if (lastClicked && lastClicked !== this) {
            lastClicked.nextElementSibling.style.maxHeight = null;
            lastClicked.nextElementSibling.style.opacity = '0';
            lastClicked.classList.remove("active");
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
        lastClicked = this;
    }
}


// for table hidden deyails-----------------------------------------------------------------------------//

// var acc = document.getElementsByClassName("butn");
// var a;

// for (a = 0; a < acc.length; a++) {
//   acc[a].addEventListener("click", function() {
//     this.classList.toggle("active");
//     var hidee = this.nextElementSibling;
//     if (hidee.style.visibility === "visible") {
//       hidee.style.visibility = "hidden";
//       hidee.style.opacity = 0;

//     } else {
//       hidee.style.visibility = "visible";
//       hidee.style.opacity = 1;
//     }
//   });
// }

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

$("#update-section").submit(function (sect) {
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

// if (window.location.pathname == "/admin/all-section") {
//   $ondelete = $(".table tbody td a.delete");
//   $ondelete.click(function () {
//     var id = $(this).attr("section-id");

//     var request = {
//      "url": `/admin/deleted/${id}`,
//      "method": "DELETE",
//     };

//     if (confirm("Do you really want to delete the record?")) {
//       $.ajax(request).done(function (response) {
//         alert("Data Delete Successfully!");
//         location.reload();
//       });
//     }
//   });
// }

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
    console.log("Current class Updated Successfully!")
  });
});


$(document).ready(function() {
  $('.switch').click(function() {
    const switchId = $(this).find('input').data('user-id');
    const updatedStatus = $(this).find('input').is(':checked');

    $.ajax({
      url: `/admin/user-status/${switchId}`,
      type: 'PATCH',
      data: { status: updatedStatus },
      success: function(data) {
        alert('Status changed successfully')
        location.reload()
      },
      error: function(error) {
        console.error(error);
      }
    });
  });
});


$(document).ready(function() {
  $('.switcher').click(function() {
    const switchId = $(this).find('input').data('staff-id');
    const updatedStatus = $(this).find('input').is(':checked');

    $.ajax({
      url: `/school/staff-status/${switchId}`,
      type: 'PATCH',
      data: { status: updatedStatus },
      success: function(data) {
        alert('Status changed successfully')
        location.reload()
      },
      error: function(error) {
        console.error(error);
      }
    });
  });
});


$("#blessing").submit(function (event) {
  event.preventDefault();

  var unindexed_array = $(this).serializeArray();
  var data = {};

  $.map(unindexed_array, function (n, i) {
    data[n["name"]] = n["value"];
  });

  console.log(data);
  var request = {
    url: "/result/register_exam",
    method: "POST",
    data: data,
  };

  $.ajax(request).done(function (response) {
    alert("Exam Created Successfully!");
    location.reload()
    console.log("Data Updated Successfully!");
  });
});


$("#myblessing").submit(function (event) {
  event.preventDefault();

  var unindexed_array = $(this).serializeArray();
  var data = {};

  $.map(unindexed_array, function (n, i) {
    data[n["name"]] = n["value"];
  });

  console.log(data);
  var request = {
    url: "/third_term_exam/register_exams",
    method: "POST",
    data: data,
  };

  $.ajax(request).done(function (response) {
    alert("Exam Created Successfully!");
    location.reload()
    console.log("Data Updated Successfully!");
  });
});
