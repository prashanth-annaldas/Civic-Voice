let map;

// ---------------- MAP INIT ----------------
function initMap(lat, lng) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom: 14
  });
  loadIssues();
}

// ---------------- GET LOCATION ----------------
navigator.geolocation.getCurrentPosition(pos => {
  initMap(pos.coords.latitude, pos.coords.longitude);
});

// ---------------- UPLOAD ISSUE ----------------
function sendIssue() {
  const file = document.getElementById("image").files[0];
  if (!file) {
    alert("Please select an image");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const data = new FormData();
    data.append("file", file);
    data.append("lat", pos.coords.latitude);
    data.append("lng", pos.coords.longitude);

    fetch("http://localhost:8000/upload", {
      method: "POST",
      body: data
    })
    .then(res => res.json())
    .then(res => {
      alert("Detected issue: " + res.issue.label);
      loadIssues();
    });
  });
}

// ---------------- LOAD MAP MARKERS ----------------
function loadIssues() {
  fetch("http://localhost:8000/issues")
    .then(res => res.json())
    .then(data => {
      data.forEach(issue => {
        let color = "blue";
        if (issue.type === "pothole") color = "red";
        if (issue.type === "garbage") color = "green";

        new google.maps.Marker({
          position: { lat: issue.lat, lng: issue.lng },
          map,
          icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
        });
      });
    });
}

// ---------------- ADMIN DASHBOARD ----------------
function loadAdmin() {
  fetch("http://localhost:8000/issues")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("list");
      if (!list) return;

      list.innerHTML = "";
      data.forEach((i, idx) => {
        list.innerHTML += `
          <li>
            ${i.type} - ${i.status}
            <button onclick="resolve(${idx})">Resolve</button>
          </li>`;
      });
    });
}

function resolve(index) {
  fetch(`http://localhost:8000/resolve/${index}`, {
    method: "POST"
  }).then(() => loadAdmin());
}

