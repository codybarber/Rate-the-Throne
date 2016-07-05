var app = angular.module('rateThroneApp', ['ui.bootstrap']);

var map;
var atlanta = {lat: 33.8486730, lng: -84.3733130};
var place;

//modal controller
app.controller('ModalController', function($scope, place, $uibModalInstance) {
  $scope.place = place;
  $scope.location = linkDataModal(place.place_id);
  $scope.averageRating = ratingAverageModal(linkDataModal(place.place_id));
  $scope.modalReviewData = $scope.location.review;
  $scope.publicOrNot = $scope.location.public;

  //add a new review function
  $scope.addNewReview = function(author, rating, comment) {
    $scope.newReview = {
      "author": author,
      "rating": rating,
      "comment": comment
    };
    $scope.modalReviewData.push($scope.newReview);
    document.reviewForm.reset();
    document.getElementById('submit-review').style.visibility='hidden';
  };

  //function to link data from Google Maps to our data for modal
  function linkDataModal(placeId) {
    for (var i = 0; i < reviewData.length; i++) {
      if (placeId === reviewData[i].place_id) {
        return reviewData[i];
      }
    }
  }

  //function to find averge rating for modal
  function ratingAverageModal(placeId) {
    var someLocation = linkDataModal(place.place_id);
    var sum = 0;
    if (someLocation.review.length === 0) {
      return "No reviews yet!";
    }
    for (var i = 0; i < someLocation.review.length; i++) {
      sum += someLocation.review[i].rating;
    }
    var avg = Math.ceil(sum / someLocation.review.length);
    //add stars instead of text
    if (avg === 5) {
      return "★★★★★";
    } else if (avg === 4) {
      return "★★★★☆";
    } else if (avg === 3) {
      return "★★★☆☆";
    } else if (avg === 2) {
      return "★★☆☆☆";
    } else if (avg === 1) {
      return "★☆☆☆☆";
    } else {
      return "I need a Rating!";
    }
  }

  //close out of modal
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

//modal service
app.factory('modal', function($uibModal){
  return {
    openModal: function(place, size) {
      var modalInstance = $uibModal.open({
        // animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalController',
        size: size,
        resolve: {
          place: function () {
            return place;
          }
        }
      });
    }
  };
});


//google maps service
app.factory('googleMaps', function($uibModal, modal) {
  return {
    //build map
    newMap: function(city) {
      var element = document.getElementById('map');
      var mapOptions = {
        center: atlanta,
        zoom: 17,
        //change map colors
        styles: [
          {
            "featureType": "landscape",
            "stylers": [
              {
                "hue": "#FFBB00"
              },
              {
                "saturation": 43.400000000000006
              },
              {
                "lightness": 37.599999999999994
              },
              {
                "gamma": 1
              }
            ]
          },
          {
            "featureType": "road.highway",
            "stylers": [
              {
                "hue": "#FFC200"
              },
              {
                "saturation": -61.8
              },
              {
                "lightness": 45.599999999999994
              },
              {
                "gamma": 1
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "stylers": [
              {
                "hue": "#FF0300"
              },
              {
                "saturation": -100
              },
              {
                "lightness": 51.19999999999999
              },
              {
                "gamma": 1
              }
            ]
          },
          {
            "featureType": "road.local",
            "stylers": [
              {
                "hue": "#FF0300"
              },
              {
                "saturation": -100
              },
              {
                "lightness": 52
              },
              {
                "gamma": 1
              }
            ]
          },
          {
            "featureType": "water",
            "stylers": [
              {
                "hue": "#0078FF"
              },
              {
                "saturation": -13.200000000000003
              },
              {
                "lightness": 2.4000000000000057
              },
              {
                "gamma": 1
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "hue": "#00FF6A"
              },
              {
                "saturation": -1.0989010989011234
              },
              {
                "lightness": 11.200000000000017
              },
              {
                "gamma": 1
              }
            ]
          }
        ]
      };
      map = new google.maps.Map(element, mapOptions);
      return map;
    },
    //add markers to map
    addMarker: function(result, map, $scope) {
      var service = new google.maps.places.PlacesService(map);
      //get locations based off of type - bar, store, restaurant
      service.nearbySearch({
        location: atlanta,
        radius: 850,
        types: ['bar', 'store', 'restaurant']
      }, callback);

      //callback function for marker results
      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            place = results[i];
            createMarker(results[i]);
          }
        }
      }

      //function to create marker - using different symbols
      function createMarker(place) {
        var placeLoc = place.geometry.location;
        var theIcon = 'images/bathroomsymbolsmall.png';
        var theRating = ratingAverage(place.place_id);
        var publicRestroom = linkData(place.place_id).public;
        //different icons
        if (publicRestroom === false) {
          theIcon = 'images/noGo.png';
        } else {
          if (theRating >= 2 && theRating < 4) {
            theIcon = 'images/orange.png';
          } else if (theRating >= 4) {
            theIcon = 'images/green.png';
          } else if (theRating < 2) {
            theIcon = 'images/red.png';
          }
        }

        //plot markers
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          icon: theIcon
        });

        //link google maps data with our data
        function linkData(placeId) {
          for (var i = 0; i < reviewData.length; i++) {
            if (placeId === reviewData[i].place_id) {
              return reviewData[i];
            }
          }
        }

        //calculate average rating
        function ratingAverage(placeId) {
          var someLocation = linkData(place.place_id);
          console.log(someLocation.review.length);
          var sum = 0;
          if (someLocation.review.length === 0) {
            return "No reviews yet!";
          }
          for (var i = 0; i < someLocation.review.length; i++) {
            sum += someLocation.review[i].rating;
          }
          return sum / someLocation.review.length;
        }

        //click to open modal
        google.maps.event.addListener(marker, 'click', function() {
          modal.openModal(place, 'lg');
        });
        var easterEggMarker = new google.maps.Marker({
          map: map,
          position: {lat: 33.852746033, lng: -84.3622450},
          icon: 'images/green.png'
        });
        google.maps.event.addListener(easterEggMarker, "click", function() {
          console.log("you clicked");
          $(document).ready(function(){
            $('#easterEgg').removeClass("hideIt");
            $('#easterEgg').addClass("showIt");
            window.setTimeout(function(){
              $('#easterEgg').addClass("hideIt");
            }, 7000);
          });
        });
      }
    }
  };
});


  //main controller
  app.controller('MainController', function($scope, googleMaps, $uibModal, modal) {
    //add map
    var map = googleMaps.newMap(atlanta);
    googleMaps.addMarker(place, map, $scope);
  });

  $(document).ready(function(){
    window.setTimeout(function(){
      document.getElementById("banner").innerHTML = "";
      $('#banner').addClass('hideIt');
      $('#mainContent').removeClass('hideIt');
      $('#mainContent').addClass('showIt');
    }, 4000);
    window.setTimeout(function(){
      $('#header').addClass('animated fadeInLeft');
      $('#map').addClass('animated fadeInRight');
      $('#legendRow').addClass('legend animated fadeInUp');
      // $('#mainContent').addClass('showIt');
    }, 4000);
  });
