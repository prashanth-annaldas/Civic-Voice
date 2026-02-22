import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import HeatmapLayer from "./HeatmapLayer";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function IssuesMap({ issues, showHeatmap = false }) {
  const heatPoints = issues.map((iss) => [iss.lat, iss.lng, iss.severity_score ? iss.severity_score / 100 : 0.5]);

  return (
    <MapContainer
      center={[17.5965, 78.4819]}
      zoom={14}
      style={{ height: "450px", width: "100%", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {showHeatmap && <HeatmapLayer points={heatPoints} />}

      {!showHeatmap && issues.map((issue) => (
        issue.cluster_id ? (
          <CircleMarker key={`c-${issue.id}`} center={[issue.lat, issue.lng]} radius={issue.issue_count ? issue.issue_count * 5 : 10} color={issue.escalated ? "red" : "blue"}>
            <Popup>
              <b>Cluster (Issues: {issue.issue_count || 1})</b><br />
              Severity: {issue.severity_score}/100<br />
              {issue.type}
            </Popup>
          </CircleMarker>
        ) : (
          <Marker key={issue.id} position={[issue.lat, issue.lng]}>
            <Popup>
              <b>{issue.type}</b><br />
              Severity: {issue.severity_score || 'N/A'}<br />
              {issue.description}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}

export default IssuesMap;
