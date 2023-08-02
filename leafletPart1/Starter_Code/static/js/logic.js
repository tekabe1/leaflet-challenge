
// Create the map
let myMap = L.map("map", {
  center: [48.22495, -96.152344],
  zoom: 3,
});

// Create the tile layer for the base map
let openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(myMap);

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
  let myMarkers = L.featureGroup(); // Create a feature group to store markers

  for (let i = 0; i < earthquakeData.length; i++) {
    let earthquake = earthquakeData[i];

    // Create a circle marker for each earthquake and add to the feature group
    L.circleMarker(
      [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]],
      {
        fillColor: getColor(earthquake.geometry.coordinates[2]),
        color: "gray",
        weight: 1,
        fillOpacity: 0.7,
        radius: getMarkerSize(earthquake.properties.mag),
      }
    )
      .bindPopup(
        `<strong>Location:</strong> ${earthquake.properties.place}<br>
                <strong>Magnitude:</strong> ${earthquake.properties.mag}<br>
                <strong>Depth:</strong> ${earthquake.geometry.coordinates[2]} km`
      )
      .addTo(myMarkers);
  }

  // Add the feature group to the map and fit the map bounds to show all markers
  myMarkers.addTo(myMap);
  myMap.fitBounds(myMarkers.getBounds());
}

// Perform a GET request to the earthquake data.
d3.json(
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
).then(function (data) {
  createFeatures(data.features);
});

// Function to create the legend
function createLegend() {
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depthCategories = [0, 10, 50];
    let colors = depthCategories.map(getColor);
    let labels = [];

    let legendInfo = "<h1>Earthquake Depth (km)</h1>";

    div.innerHTML = legendInfo;

    depthCategories.forEach(function (limit, index) {
      labels.push(
        '<li style="background-color: ' +
        colors[index] +
        '"></li> ' +
        depthCategories[index] +
        (depthCategories[index + 1]
          ? "&ndash;" + (depthCategories[index + 1] - 1) + " km<br>"
          : "+ km")
      );
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  legend.addTo(myMap);
}

// Call the function to create the legend
createLegend();

