import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! Describe an issue you see, and I'll help report it." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState(null);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/chatbot/parse`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
            } else {
                setParsedData(data.parsed);
                const reply = `I found these details:\n- Type: ${data.parsed.issue_type}\n- Location: ${data.parsed.location}\n- Urgency: ${data.parsed.urgency}\n\nShall I submit this report using your current GPS location?`;
                setMessages(prev => [...prev, { role: "assistant", content: reply, showSubmit: true }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request." }]);
        }
        setLoading(false);
    };

    const handleSubmitReport = () => {
        if ("geolocation" in navigator && parsedData) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // We'll use the existing /requests endpoint which takes description, lat, lng
                    const res = await fetch(`${API_URL}/requests`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            description: `[AI Reported] ${parsedData.issue_type} near ${parsedData.location} | Urgency: ${parsedData.urgency} | ${parsedData.description}`,
                            latitude,
                            longitude
                        })
                    });
                    if (res.ok) {
                        setMessages(prev => [...prev, { role: "assistant", content: "✅ Report submitted successfully!" }]);
                        setParsedData(null);
                    } else {
                        setMessages(prev => [...prev, { role: "assistant", content: "❌ Submission failed." }]);
                    }
                } catch (e) {
                    setMessages(prev => [...prev, { role: "assistant", content: "❌ Network error." }]);
                }
                setLoading(false);
            }, () => {
                setMessages(prev => [...prev, { role: "assistant", content: "❌ Please enable location services to submit." }]);
                setLoading(false);
            });
        } else {
            setMessages(prev => [...prev, { role: "assistant", content: "Geolocation is not supported by your browser." }]);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#4e73df", color: "white", border: "none", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", fontSize: "24px", cursor: "pointer" }}
                >
                    💬
                </button>
            )}

            {isOpen && (
                <div style={{ width: "350px", height: "500px", background: "white", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ background: "#4e73df", color: "white", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h5 style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>🤖 Civic AI Assistant</h5>
                        <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "18px" }}>✖</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: "15px", overflowY: "auto", background: "#f8f9fc" }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ marginBottom: "12px", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    background: m.role === "user" ? "#4e73df" : "#eaecf4",
                                    color: m.role === "user" ? "white" : "#5a5c69",
                                    padding: "10px 14px",
                                    borderRadius: "15px",
                                    maxWidth: "85%",
                                    whiteSpace: "pre-wrap",
                                    fontSize: "14px"
                                }}>
                                    {m.content}
                                </div>
                                {m.showSubmit && (
                                    <button onClick={handleSubmitReport} disabled={loading} style={{ marginTop: "8px", padding: "8px 12px", background: "#1cc88a", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>
                                        {loading ? "Submitting..." : "Submit Report 📍"}
                                    </button>
                                )}
                            </div>
                        ))}
                        {loading && !messages[messages.length - 1]?.showSubmit && (
                            <div style={{ alignSelf: "flex-start", background: "#eaecf4", color: "#5a5c69", padding: "10px 14px", borderRadius: "15px", fontSize: "14px", fontStyle: "italic" }}>Typing...</div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #e3e6f0", background: "white" }}>
                        <input
                            style={{ flex: 1, padding: "10px 15px", border: "1px solid #d1d3e2", borderRadius: "20px", outline: "none", fontSize: "14px" }}
                            placeholder="E.g. The streetlight is broken"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            style={{ marginLeft: "10px", padding: "10px 15px", background: "#4e73df", color: "white", border: "none", borderRadius: "20px", cursor: "pointer" }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chatbot;
