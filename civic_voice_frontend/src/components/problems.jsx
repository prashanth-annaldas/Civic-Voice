import { useState } from "react";
import Location from "./geoLocation";
import "bootstrap/dist/css/bootstrap.min.css";

function Problems() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file); 
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload an image first");
      return;
    }

    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lat", 0);
    formData.append("lng", 0);
    formData.append("description", text);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.issue.type);
    } catch (err) {
      setResult("Error detecting issue");
    }

    setLoading(false);
  };


  return (
    <div className="container mt-4">
      <div className="row justify-content-center">

        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">

            {preview ? (
              <img
                src={preview}
                className="card-img-top"
                style={{ height: "220px", objectFit: "cover" }}
                alt="Preview"
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center bg-secondary text-white"
                style={{ height: "220px" }}
              >
                No Image Selected
              </div>
            )}

            <div className="card-body">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImage}
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label fw-semibold">Describe the problem</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Write problem details..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Location />
          </div>

          <button
            className="btn btn-primary px-4"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Submit"}
          </button>

          {result && (
            <div className="alert alert-info mt-3">
              <strong>Detected Issue:</strong> {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Problems;
