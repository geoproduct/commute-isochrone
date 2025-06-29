let map = L.map('map').setView([37.5665, 126.9780], 13);  // 서울 중심

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = null;

map.on('click', function(e) {
  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);
  console.log("📍 위치 선택:", e.latlng);
});

function analyze() {
  if (!marker) {
    alert("먼저 지도를 클릭해 위치를 선택하세요.");
    return;
  }
  const time = document.getElementById('timeInput').value;
  const coords = marker.getLatLng();

  fetch("https://your-api-url/isochrone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lat: coords.lat,
      lng: coords.lng,
      minutes: parseInt(time)
    })
  })
  .then(response => response.json())
  .then(geojson => {
    if (window.isochroneLayer) map.removeLayer(window.isochroneLayer);
    window.isochroneLayer = L.geoJSON(geojson, {
      style: { color: "blue", fillOpacity: 0.3 }
    }).addTo(map);
  });
}

