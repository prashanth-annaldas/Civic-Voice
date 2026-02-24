import { useState } from "react";

function LocationInput({ setLat, setLng }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLat(latitude);
        setLng(longitude);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en-US,en;q=0.9",
              }
            }
          );
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setAddress(data.display_name || "Location found");
          } catch (e) {
            throw new Error("Invalid JSON from geocoder");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setAddress(`Location detected, but address unavailable (${err.message})`);
        }
      },
      () => {
        setError("Permission denied or location unavailable");
        setLoading(false);
      }
    );
  };

  return (
    <div className="mb-3">
      <button className="btn btn-outline-primary" onClick={getLocation}>
        📍 Get Current Location
      </button>

      {loading && <p className="text-muted mt-2">Fetching location...</p>}

      {address && (
        <p className="mt-2">
          <strong>Location:</strong> {address}
        </p>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
}

export default LocationInput;