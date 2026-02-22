import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = import.meta.env.VITE_API_URL;

function Account() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setName(data.name || "");
            }
        } catch (err) {
            console.error("Failed to fetch user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
                fetchUser(); // Refresh user data
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to update profile");
            }
        } catch (err) {
            setError("Server error");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">My Account</h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSave}>
                        <div className="mb-3">
                            <label className="form-label text-muted">Email Address</label>
                            <input
                                type="email"
                                className="form-control bg-light"
                                value={user?.email || ""}
                                disabled
                            />
                            <div className="form-text">Your email address cannot be changed.</div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        {user && (
                            <div className="mb-4 p-3 bg-light rounded text-center">
                                <h5>🌟 Civic Reputation</h5>
                                <div className="d-flex justify-content-around mt-3">
                                    <div>
                                        <p className="mb-0 text-muted">Points</p>
                                        <h3 className="fw-bold text-success">{user.points || 0}</h3>
                                    </div>
                                    <div>
                                        <p className="mb-0 text-muted">Trust Score</p>
                                        <h3 className="fw-bold text-primary">{user.trust_score || 100}</h3>
                                    </div>
                                </div>
                                {(user.badges && user.badges.length > 0) && (
                                    <div className="mt-3">
                                        <p className="mb-1 text-muted">Badges:</p>
                                        {user.badges.map((b, i) => b.trim() && (
                                            <span key={i} className="badge bg-warning text-dark me-1 py-1 px-2">🎖️ {b.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {message && <div className="alert alert-success">{message}</div>}
                        {error && <div className="alert alert-danger">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving || name === user?.name}
                        >
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Account;
