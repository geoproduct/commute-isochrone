let map = L.map('map').setView([37.5665, 126.9780], 13);  // 서울 중심

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = null;
let isochroneLayer = null;

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

  fetch("https://commute-isochrone.onrender.com/isochrone", {
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
    console.log("✅ 분석 결과 GeoJSON:", geojson);

    if (isochroneLayer) map.removeLayer(isochroneLayer);
    isochroneLayer = L.geoJSON(geojson, {
      style: {
        color: "blue",
        fillOpacity: 0.3,
        weight: 2
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error("❌ API 호출 실패:", err);
    alert("분석 중 오류 발생!");
  });
}
