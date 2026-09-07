import React, { useEffect, useState, useRef } from 'react';
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
          Fine-tuned YOLO detects plates, EasyOCR/TrOCR reads the text, and a MobileNetV2 CNN module classifies the vehicle type.
        </p>
        <div className="hero-actions">
          <button onClick={() => setPage('image')}>Try Image Upload</button>
          <button className="secondary" onClick={() => setPage('video')}>Process Video</button>
        </div>
      </div>
      <div className="stats-grid">
        <Metric icon={<Gauge />} value="640px" label="YOLO input size" />
        <Metric icon={<Activity />} value="Fast" label="Transformer OCR" />
        <Metric icon={<UploadCloud />} value="CNN" label="Vehicle Classifier" />
      </div>
      <div className="pipeline-card">
        <h2>Pipeline</h2>
        <div className="pipeline">
          <span>Upload</span>
          <span>YOLO Detection</span>
          <span>Plate Crop</span>
          <span>TrOCR</span>
          <span>Vehicle CNN</span>
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

  // If we have an image result, show the Wizard. For video, show the old ResultPanel.
  if (result && type === 'image') {
    return <ImageWizard result={result} onReset={() => setResult(null)} />;
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
      {result && type === 'video' && <ResultPanel result={result} type={type} />}
    </section>
  );
}

// ----------------------------------------------------
// NEW WIZARD COMPONENT FOR IMAGES
// ----------------------------------------------------
function ImageWizard({ result, onReset }) {
  const [step, setStep] = useState(1);
  const det = result.detections[0] || null;

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1. YOLO Detection</div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2. TrOCR Reading</div>
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3. Vehicle CNN</div>
        <div className={`step-dot ${step >= 4 ? 'active' : ''}`}>4. Final Output</div>
      </div>

      <div className="wizard-content">
        {step === 1 && (
          <div className="wizard-slide">
            <h2>Model 1: YOLO Object Detection</h2>
            <p>YOLO locates the precise bounding box of the license plate.</p>
            <img src={`${API_BASE}${result.output_path}`} className="wizard-image-large" alt="YOLO Output" />
            {det && (
              <div className="wizard-confidence">Confidence: {(det.detection_confidence * 100).toFixed(1)}%</div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="wizard-slide">
            <h2>Model 2: TrOCR Vision Transformer</h2>
            <p>TrOCR reads the characters from the cropped license plate.</p>
            {det ? (
              <>
                <PlateCanvas bbox={det.bbox} imageUrl={`${API_BASE}${result.output_path}`} />
                <div className="wizard-text-large">{det.plate_text || 'UNREADABLE'}</div>
                <div className="wizard-confidence">OCR Confidence: {(det.ocr_confidence * 100).toFixed(1)}%</div>
              </>
            ) : (
              <p>No plate was detected for OCR to read.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="wizard-slide">
            <h2>Model 3: MobileNetV2 CNN</h2>
            <p>The CNN classifies the full vehicle type for toll assessment.</p>
            {det ? (
              <>
                <div className="wizard-vehicle-type">{det.vehicle_type || 'Unknown'}</div>
              </>
            ) : (
              <p>No vehicle detected.</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="wizard-slide" style={{ maxWidth: '100%' }}>
            <h2>Final Pipeline Integration</h2>
            <p>All models executed sequentially.</p>
            <ResultPanel result={result} type="image" />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <button className="secondary" onClick={() => step > 1 ? setStep(s => s - 1) : onReset()}>
          {step === 1 ? 'Start Over' : 'Previous'}
        </button>
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)}>Next Model</button>
        ) : (
          <button onClick={onReset}>Process Another Image</button>
        )}
      </div>
    </div>
  );
}

// Canvas component to crop and zoom the license plate
function PlateCanvas({ bbox, imageUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !bbox) return;
    const ctx = canvasRef.current.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for cors if needed
    img.src = imageUrl;
    img.onload = () => {
      const [x1, y1, x2, y2] = bbox;
      const w = x2 - x1;
      const h = y2 - y1;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      ctx.drawImage(img, x1, y1, w, h, 0, 0, w, h);
    };
  }, [bbox, imageUrl]);

  return <canvas ref={canvasRef} className="wizard-crop-canvas" />;
}
// ----------------------------------------------------

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
            <div>
              <strong>{item.plate_text || 'Unreadable'}</strong>
              <div style={{color: '#aeb9cc', marginTop: 4}}>{item.vehicle_type}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>YOLO: {(item.detection_confidence * 100).toFixed(1)}%</span>
              <span>OCR: {(item.ocr_confidence * 100).toFixed(1)}%</span>
            </div>
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
            <tr><th>Plate</th><th>Vehicle</th><th>Source</th><th>YOLO</th><th>OCR</th><th>Valid</th><th>Time</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.plate_text}</td>
                <td>{item.vehicle_type || 'Unknown'}</td>
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
        <article><h2>TrOCR</h2><p>TrOCR (Vision Transformer) reads cropped plate regions after processing by YOLO.</p></article>
        <article><h2>CNN Module</h2><p>MobileNetV2 CNN classifies vehicle types (Car, Truck, Motorcycle) for tolling rules.</p></article>
        <article><h2>Status</h2><p>{health?.models?.yolo_weights_found ? 'YOLO weights found. Backend is ready.' : 'YOLO weights missing. Train in Colab and copy best.pt.'}</p></article>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
