

// Create the map
let myMap = L.map("map", {
    center: [48.22495, -96.152344],
    zoom: 3,
  });
  
  // Create the tile layers for different base maps
  let openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  let openTopoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png");
  
  // Create a layer group for the earthquakes and tectonic plates
  let earthquakeLayer = L.layerGroup().addTo(myMap);
  let tectonicPlateLayer = L.layerGroup().addTo(myMap);
  
  // Create the overlay object to hold the layers
  let overlays = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlateLayer,
  };
  
  // Create the base layers object to hold the base map options
  let baseLayers = {
    "OpenStreetMap": openStreetMap,
    "OpenTopoMap": openTopoMap,
  };
  
  // Add the default base layer to the map
  openStreetMap.addTo(myMap);
  
  // Function to determine the color based on earthquake depth
  function getColor(depth) {
    if (depth < 10) {
      return "#ff0000"; // red for shallow earthquakes
    } else if (depth < 50) {
      return "#ffff00"; // yellow for moderate-depth earthquakes
    } else {
      return "#0000ff"; // blue for deep earthquakes
    }
  }
  
  // Function to determine the marker size based on earthquake magnitude
  function getMarkerSize(magnitude) {
    return magnitude * 4; // Adjust the scale as needed
  }
  
  // Function to create earthquake markers and popups
  function createFeatures(earthquakeData) {
    for (let i = 0; i < earthquakeData.length; i++) {
      let earthquake = earthquakeData[i];
  
      // Create a circle marker for each earthquake and add it to the earthquake layer
      L.circleMarker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], {
        fillColor: getColor(earthquake.geometry.coordinates[2]),
        color: "gray",
        weight: 1,
        fillOpacity: 0.7,
        radius: getMarkerSize(earthquake.properties.mag),
      })
        .bindPopup(`<strong>Location:</strong> ${earthquake.properties.place}<br>
                  <strong>Magnitude:</strong> ${earthquake.properties.mag}<br>
                  <strong>Depth:</strong> ${earthquake.geometry.coordinates[2]} km`)
        .addTo(earthquakeLayer);
    }
  }
  
  // Function to create tectonic plates layer and add it to the map
  function createTectonicPlateLayer(tectonicPlateData) {
    L.geoJSON(tectonicPlateData, {
      style: {
        color: "#ff8000", // orange color for tectonic plates
        weight: 2,
      },
    }).addTo(tectonicPlateLayer);
  }
  
  // Perform a GET request to the earthquake data.
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });
  
  // Perform a GET request to the tectonic plates data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
    // Once we get a response, send the data.features object to the createTectonicPlateLayer function.
    createTectonicPlateLayer(data.features);
  });
  
  // Add layer controls to the map
  L.control.layers(baseLayers, overlays).addTo(myMap);
  
  // Function to create the legend
  function createLegend() {
    let legend = L.control({ position: "bottomright" });
  
    legend.onAdd = function (map) {
      let div = L.DomUtil.create("div", "info legend"),
        depthCategories = [0, 10, 50], // Adjust these depth categories as needed
        colors = depthCategories.map(getColor),
        labels = [];
  
      // Add the legend title
      let legendInfo = "<h1>Earthquake Depth (km)</h1>";
      div.innerHTML = legendInfo;
  
      // Loop through depthCategories to create legend labels with corresponding colors
      depthCategories.forEach(function (limit, index) {
        labels.push(
          '<li style="background-color:' +
          colors[index] +
          '"></li> ' +
          depthCategories[index] +
          (depthCategories[index + 1] ? "&ndash;" + (depthCategories[index + 1] - 1) + " km<br>" : "+ km")
        );
      });
  
      // Combine the labels and add them to the legend
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };
  
    // Add the legend to the map
    legend.addTo(myMap);
  }
  
  // Create the legend
  createLegend();
  