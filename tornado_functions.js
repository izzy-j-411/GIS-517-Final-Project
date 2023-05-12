// index.js
$(function() {
  var map = L.map('map').setView([37.8, -96], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  var south_west = L.latLng(24.396308, -125.000000),
      north_east = L.latLng(49.384358, -66.934570),
      bounds = L.latLngBounds(south_west, north_east);
  map.setMaxBounds(bounds);
  map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: true });
  });

  // We Define my tornado_data accumulator fucntion:
  var tornado_data = [];

  // We fetch the csv files from the my GitHub repository. This was the only way to host csv files:
  var files = [
    "https://raw.githubusercontent.com/izzy-j-411/GIS-517-Final-Project/main/2018_torn.csv",
    "https://raw.githubusercontent.com/izzy-j-411/GIS-517-Final-Project/main/2019_torn.csv",
    "https://raw.githubusercontent.com/izzy-j-411/GIS-517-Final-Project/main/2020_torn.csv",
    "https://raw.githubusercontent.com/izzy-j-411/GIS-517-Final-Project/main/2021_torn.csv",
    "https://raw.githubusercontent.com/izzy-j-411/GIS-517-Final-Project/main/2022_torn.csv"
  ];

  // We load and parse the tornado data fetched above:
  function load_data(file) {
    $.ajax({
      url: file,
      success: function (csv_data) {
        var parsed_data = Papa.parse(csv_data, { header: true }).data;
        tornado_data = tornado_data.concat(parsed_data);
        add_tornado_markers(tornado_data);
      },
      dataType: "text"
    });
  }

  files.forEach(function (file) {
    load_data(file);
  });

  //  We create our map markers for tornado paths and add them to the map:
  function create_tornado_marker(tornado) {
    var start_lat_lon = L.latLng(parseFloat(tornado.slat), parseFloat(tornado.slon));
    var end_lat_lon = L.latLng(parseFloat(tornado.elat), parseFloat(tornado.elon));
    var marker = L.polyline([start_lat_lon, end_lat_lon], { color: 'blue' });
    marker.bindPopup("<b>Date:</b> " + tornado.date + "<br>" +
                     "<b>Start Time:</b> " + tornado.time + "<br>" +
                     "<b>Injuries:</b> " + tornado.inj + "<br>" +
                     "<b>Casualties:</b> " + tornado.fat + "<br>" +
                     "<b>Total Damage in Dollars:</b> " + tornado.loss); //strange names (tornado.fat for example) come directly from the csvs
    return marker;
  }
	//
  function add_tornado_markers(tornado_data) {
    tornado_data.forEach(function (tornado) {
      var marker = create_tornado_marker(tornado);
      marker.addTo(map); 
    });
  }
  
  function clear_map() {
    map.eachLayer(function (layer) {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
  }
});