import { useEffect, useState } from "react";
import IssuesMap from "./issueMap";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

function Admin() {
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [risks, setRisks] = useState([]);
  const [health, setHealth] = useState([]);
  const [mood, setMood] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showHeatmap, setShowHeatmap] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${API_BASE}/issues`).then(res => res.json()).then(data => setIssues(Array.isArray(data) ? data : [])).catch(console.error);
    fetch(`${API_BASE}/analytics`).then(res => res.json()).then(data => setAnalytics(data && data.type_distribution ? data : null)).catch(console.error);
    fetch(`${API_BASE}/predictive-risks`).then(res => res.json()).then(data => setRisks(Array.isArray(data) ? data : [])).catch(console.error);
    fetch(`${API_BASE}/area-health`).then(res => res.json()).then(data => setHealth(Array.isArray(data) ? data : [])).catch(console.error);
    fetch(`${API_BASE}/city-mood`).then(res => res.json()).then(data => setMood(data && data.frustration_patterns ? data : null)).catch(console.error);
  }, [API_BASE]);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "2rem", paddingTop: "100px" }}>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ fontWeight: "700", color: "#2c3e50" }}>🏙️ Civic Analytics Control Center</h2>
          <div>
            <span className="badge bg-success p-2 me-2" style={{ fontSize: "1rem" }}>
              City Health Score: {analytics ? analytics.health_score : "..."}/100
            </span>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
              📊 Overview
            </button>
          </li>
          <li className="nav-item mx-2">
            <button className={`nav-link ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>
              🗺️ Live Heatmap
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "risks" ? "active" : ""}`} onClick={() => setActiveTab("risks")}>
              ⚠️ Predictive Risks
            </button>
          </li>
        </ul>

        {/* Content */}
        {activeTab === "dashboard" && analytics && (
          <div className="row">
            {/* KPI Cards */}
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm border-0 text-center p-3">
                <h5 className="text-muted">Total Issues</h5>
                <h3 className="fw-bold text-primary">{analytics.total_issues}</h3>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm border-0 text-center p-3">
                <h5 className="text-muted">Resolved</h5>
                <h3 className="fw-bold text-success">{analytics.resolved_issues}</h3>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm border-0 text-center p-3">
                <h5 className="text-muted">Avg. Resolution</h5>
                <h3 className="fw-bold text-warning">{analytics.avg_resolution_time}</h3>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm border-0 text-center p-3">
                <h5 className="text-muted">Active High Risks</h5>
                <h3 className="fw-bold text-danger">{risks.length}</h3>
              </div>
            </div>

            {/* Sentiment / Mood Card */}
            {mood && (
              <div className="col-md-12 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-primary text-white" style={{ background: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="fw-bold mb-1">🎭 City Mood Index: {mood.mood_score}/100</h4>
                      <p className="mb-2" style={{ opacity: 0.9 }}>{mood.summary}</p>
                      <div className="d-flex flex-wrap mt-2">
                        {mood.frustration_patterns.map((p, i) => (
                          <span key={i} className="badge bg-light text-primary me-2 mb-2 p-2"># {p}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: "4rem" }}>
                      {mood.mood_score > 70 ? "😊" : mood.mood_score > 40 ? "😐" : "😠"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm border-0 p-3 h-100">
                <h5 className="mb-3">Issue Types Distribution</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.type_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {analytics.type_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm border-0 p-3 h-100">
                <h5 className="mb-3">Department Workload</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.department_distribution}>
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3498db" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="card shadow-sm border-0 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Live City Map & Clusters</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="heatmapToggle"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor="heatmapToggle">
                  🔥 Density Heatmap
                </label>
              </div>
            </div>
            <IssuesMap issues={issues} showHeatmap={showHeatmap} />
          </div>
        )}

        {activeTab === "risks" && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h4 className="text-danger mb-4">🚨 Future Risk Alerts</h4>
                {risks.length === 0 ? (
                  <p className="text-success">No high-risk areas detected currently.</p>
                ) : (
                  <div className="list-group">
                    {risks.map((r, i) => (
                      <div key={i} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1 text-danger">{r.alert_message}</h6>
                          <small className="text-muted">Severity Score: {r.severity_score}/100 | Coordinates: {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</small>
                        </div>
                        <span className="badge bg-danger rounded-pill p-2" style={{ fontSize: "1rem" }}>
                          {r.failure_probability_percent}% Fail Risk
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 mt-4">
              <div className="card shadow-sm border-0 p-4">
                <h4 className="mb-4">🛡️ Area Health Index</h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Location Coordinates</th>
                        <th>Health Score (0-100)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {health.map((h, i) => (
                        <tr key={i}>
                          <td>{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</td>
                          <td>
                            <div className="progress" style={{ height: "20px" }}>
                              <div className={`progress-bar ${h.score > 70 ? 'bg-success' : h.score > 40 ? 'bg-warning' : 'bg-danger'}`}
                                role="progressbar" style={{ width: `${h.score}%` }} aria-valuenow={h.score} aria-valuemin="0" aria-valuemax="100">
                                {Math.round(h.score)}
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge ${h.score > 70 ? 'bg-success' : h.score > 40 ? 'bg-warning' : 'bg-danger'}`}>{h.label}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
