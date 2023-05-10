$(function() {
  var map = L.map('map').setView([37.8, -96], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);
  var southWest = L.latLng(24.396308, -125.000000),
      northEast = L.latLng(49.384358, -66.934570),
      bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);
  map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
  });

  var tornadoData = [];

  var files = ["2018_torn.csv", "2019_torn.csv", "2020_torn.csv", "2021_torn.csv", "2022_torn.csv"];

  function loadData(file) {
    $.ajax({
      url: file,
      success: function (csvData) {
        var parsedData = Papa.parse(csvData, { header: true }).data;
        tornadoData = tornadoData.concat(parsedData);
        addTornadoMarkers(tornadoData);
      },
      dataType: "text"
    });
  }

  files.forEach(function (file) {
    loadData(file);
  });

  function createTornadoMarker(tornado) {
    var startLatLng = L.latLng(parseFloat(tornado.slat), parseFloat(tornado.slon));
    var endLatLng = L.latLng(parseFloat(tornado.elat), parseFloat(tornado.elon));
    var marker = L.polyline([startLatLng, endLatLng], {color: 'red'});
    marker.bindPopup("<b>Date:</b> " + tornado.date + "<br>" +
                     "<b>Start Time:</b> " + tornado.time + "<br>" +
                     "<b>Injuries:</b> " + tornado.inj + "<br>" +
                     "<b>Fatalities:</b> " + tornado.fat + "<br>" +
                     "<b>Property Damage:</b> " + tornado.loss);
    return marker;
  }

  function addTornadoMarkers(tornadoData) {
    tornadoData.forEach(function (tornado) {
      var marker = createTornadoMarker(tornado);
      marker.addTo(map); // Add the marker to the map
    });
  }

  function clearMap() {
    map.eachLayer(function (layer) {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
  }

  $( "#datepicker" ).datepicker({
    changeMonth: true,
    changeYear: true,
    onSelect: function(dateText) {
      var date = new Date(dateText);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var filteredTornadoData = tornadoData.filter(function (tornado) {
        return tornado.year == year && tornado.month == month;
      });
      clearMap();
      addTornadoMarkers(filteredTornadoData);
    }
  });
});
