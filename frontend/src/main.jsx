import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Camera, Database, FileVideo, Gauge, Home, Info, UploadCloud } from 'lucide-react';
import './styles.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [page, setPage] = useState('home');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">VP</div>
          <div>
            <strong>VisionPlate</strong>
            <span>YOLO + OCR + CNN</span>
          </div>
        </div>
        <NavButton icon={<Home />} label="Home" page="home" active={page} setPage={setPage} />
        <NavButton icon={<Camera />} label="Image Detection" page="image" active={page} setPage={setPage} />
        <NavButton icon={<FileVideo />} label="Video Detection" page="video" active={page} setPage={setPage} />
        <NavButton icon={<Database />} label="History" page="history" active={page} setPage={setPage} />
        <NavButton icon={<Info />} label="Model Details" page="details" active={page} setPage={setPage} />
        <div className="model-card">
          <span>Model Status</span>
          <strong>{health?.models?.yolo_weights_found ? 'Ready' : 'Needs best.pt'}</strong>
        </div>
      </aside>
      <main className="main-panel">
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'image' && <UploadPage type="image" endpoint="/detect/image" />}
        {page === 'video' && <UploadPage type="video" endpoint="/detect/video" />}
        {page === 'history' && <HistoryPage />}
        {page === 'details' && <DetailsPage health={health} />}
      </main>
    </div>
  );
}

function NavButton({ icon, label, page, active, setPage }) {
  return (
    <button className={`nav-button ${active === page ? 'active' : ''}`} onClick={() => setPage(page)}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomePage({ setPage }) {
  return (
    <section className="hero-grid">
      <div className="hero-card">
        <p className="eyebrow">Neural Networks And Deep Learning Project</p>
        <h1>Real-time number plate recognition for images and videos.</h1>
        <p>
          Fine-tuned YOLO detects plates, EasyOCR reads the text, preprocessing improves low-quality crops, and a CNN module supports character-level recognition experiments.
        </p>
        <div className="hero-actions">
          <button onClick={() => setPage('image')}>Try Image Upload</button>
          <button className="secondary" onClick={() => setPage('video')}>Process Video</button>
        </div>
      </div>
      <div className="stats-grid">
        <Metric icon={<Gauge />} value="640px" label="YOLO input size" />
        <Metric icon={<Activity />} value="Fast" label="Frame-stride video OCR" />
        <Metric icon={<UploadCloud />} value="CSV" label="History-ready outputs" />
      </div>
      <div className="pipeline-card">
        <h2>Pipeline</h2>
        <div className="pipeline">
          <span>Upload</span>
          <span>YOLO Detection</span>
          <span>Plate Crop</span>
          <span>CLAHE + Denoise</span>
          <span>OCR / CNN</span>
          <span>Validation</span>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, value, label }) {
  return (
    <div className="metric-card">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function UploadPage({ type, endpoint }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Detection failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-card">
      <p className="eyebrow">{type === 'image' ? 'Image ANPR' : 'Video ANPR'}</p>
      <h1>{type === 'image' ? 'Upload an image' : 'Upload a traffic video'}</h1>
      <form className="upload-box" onSubmit={submit}>
        <UploadCloud size={42} />
        <input type="file" accept={type === 'image' ? 'image/*' : 'video/*'} onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button disabled={!file || loading}>{loading ? 'Processing...' : 'Run Detection'}</button>
      </form>
      {error && <div className="error-card">{error}</div>}
      {result && <ResultPanel result={result} type={type} />}
    </section>
  );
}

function ResultPanel({ result, type }) {
  return (
    <div className="result-grid">
      <div className="preview-card">
        <h2>Annotated Output</h2>
        {type === 'image' ? (
          <img src={`${API_BASE}${result.output_path}`} alt="Annotated result" />
        ) : (
          <video src={`${API_BASE}${result.output_path}`} controls />
        )}
      </div>
      <div className="detections-card">
        <h2>Detections</h2>
        {result.detections.length === 0 && <p>No plates detected.</p>}
        {result.detections.map((item, index) => (
          <div className="detection-row" key={`${item.plate_text}-${index}`}>
            <strong>{item.plate_text || 'Unreadable'}</strong>
            <span>YOLO: {(item.detection_confidence * 100).toFixed(1)}%</span>
            <span>OCR: {(item.ocr_confidence * 100).toFixed(1)}%</span>
            <small>{item.is_valid ? 'Valid Indian format' : 'Needs review'}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/history`)
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="page-card">
      <p className="eyebrow">Stored Results</p>
      <div className="title-row">
        <h1>Detection History</h1>
        <a className="download-link" href={`${API_BASE}/history.csv`}>Download CSV</a>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr><th>Plate</th><th>Type</th><th>YOLO</th><th>OCR</th><th>Valid</th><th>Time</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.plate_text}</td>
                <td>{item.source_type}</td>
                <td>{(item.detection_confidence * 100).toFixed(1)}%</td>
                <td>{(item.ocr_confidence * 100).toFixed(1)}%</td>
                <td>{item.is_valid ? 'Yes' : 'Review'}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailsPage({ health }) {
  return (
    <section className="page-card details">
      <p className="eyebrow">Architecture</p>
      <h1>Model Details</h1>
      <div className="detail-grid">
        <article><h2>YOLO Detector</h2><p>YOLOv8 is fine-tuned in Colab on a public Indian license plate dataset. Put `best.pt` in `backend/models/yolo`.</p></article>
        <article><h2>OCR</h2><p>EasyOCR reads cropped plate regions after grayscale, CLAHE, and bilateral denoising.</p></article>
        <article><h2>CNN Module</h2><p>A character-level CNN scaffold is included for training on segmented characters and explaining the neural network component.</p></article>
        <article><h2>Status</h2><p>{health?.models?.yolo_weights_found ? 'YOLO weights found. Backend is ready.' : 'YOLO weights missing. Train in Colab and copy best.pt.'}</p></article>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
