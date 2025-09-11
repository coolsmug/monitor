
/* --------------------------------------------
Google Map
-------------------------------------------- */	

function basicmap() {
  var mapOptions = {
    zoom: 11,
    scrollwheel: false,
    center: new google.maps.LatLng(23.694182, 90.457313),
    styles: [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
]

        };
          var mapElement = document.getElementById('contact-map');
  var map = new google.maps.Map(mapElement, mapOptions);

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(23.694182, 90.457313),
    map: map,
    title: 'Cryptox'
  });
    }
    // if ($('#contact-map').length != 0) {
    //     google.maps.event.addDomListener(window, 'load', basicmap);
    // }
    


