import React, { useState, useRef, useEffect } from 'react';
import { AppView, PipelineStage, SampleTarget, DetectionPayload } from './types';
import { SAMPLES, INITIAL_PAYLOAD, AUDI_Q7_IMAGE } from './data/mockData';
import { GatewayScreen } from './components/GatewayScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StageStepper } from './components/StageStepper';
import { YoloDetectionStage } from './components/stages/YoloDetectionStage';
import { TrocrRecognitionStage } from './components/stages/TrocrRecognitionStage';
import { VehicleCnnStage } from './components/stages/VehicleCnnStage';
import { TelemetryExportStage } from './components/stages/TelemetryExportStage';
import { PipelineGraphView } from './components/views/PipelineGraphView';
import { ModelZooView } from './components/views/ModelZooView';
import { ClusterStatusView } from './components/views/ClusterStatusView';
import { ApiDocsView } from './components/views/ApiDocsView';
import { UploadCloud, PlayCircle } from 'lucide-react';

export default function App() {
  // Screen mode: 'gateway' (Image 16) or 'dashboard' (Image 4 & HTML)
  const [screenMode, setScreenMode] = useState<'dashboard' | 'gateway'>('dashboard');

  // Dashboard state
  const [currentView, setCurrentView] = useState<AppView>('inference-playground');
  const [currentStage, setCurrentStage] = useState<PipelineStage>(1);
  const [currentSample, setCurrentSample] = useState<SampleTarget>(SAMPLES[0]);
  const [payload, setPayload] = useState<DetectionPayload>(INITIAL_PAYLOAD);

  // Responsive sidebar state (closed by default on mobile/tablet, open on desktop)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [allDetections, setAllDetections] = useState<any[]>([]);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState<number>(0);

  // Automatically close sidebar on resize to mobile/tablet breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation between stages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'inference-playground' || screenMode !== 'dashboard') return;
      if (e.key === 'ArrowRight' && currentStage < 4) {
        setCurrentStage((prev) => (prev + 1) as PipelineStage);
      } else if (e.key === 'ArrowLeft' && currentStage > 1) {
        setCurrentStage((prev) => (prev - 1) as PipelineStage);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, currentStage, screenMode]);

  const loadDetection = (detection: any, imageUrl: string, fileName: string, imgWidth: number, imgHeight: number) => {
    const [x1, y1, x2, y2] = detection.bbox || [0, 0, 0, 0];
    
    const plateLeft = imgWidth ? (x1 / imgWidth) * 100 : 0;
    const plateTop = imgHeight ? (y1 / imgHeight) * 100 : 0;
    const plateWidth = imgWidth ? ((x2 - x1) / imgWidth) * 100 : 100;
    const plateHeight = imgHeight ? ((y2 - y1) / imgHeight) * 100 : 100;

    const customSample: SampleTarget = {
      id: 'custom-upload',
      name: fileName,
      imageUrl: imageUrl,
      vehicleCategory: detection.vehicle_type || 'Unknown',
      vehicleModel: 'Identified Target',
      plateText: detection.plate_text || 'UNREADABLE',
      countryCode: 'IND',
      bboxCoords: { x1, y1, x2, y2 },
      cropRect: { 
        sxPercent: imgWidth ? x1 / imgWidth : 0, 
        syPercent: imgHeight ? y1 / imgHeight : 0, 
        swPercent: imgWidth ? (x2 - x1) / imgWidth : 1, 
        shPercent: imgHeight ? (y2 - y1) / imgHeight : 1 
      },
      // Vehicle BBox can be full image if not provided
      vehicleBBox: { left: '0%', top: '0%', width: '100%', height: '100%' },
      plateBBox: { left: `${plateLeft}%`, top: `${plateTop}%`, width: `${plateWidth}%`, height: `${plateHeight}%` },
    };

    const newPayload: DetectionPayload = {
      ...INITIAL_PAYLOAD,
      timestamp: new Date().toISOString(),
      bounding_box: { x1, y1, x2, y2, width: x2 - x1, height: y2 - y1, confidence: detection.detection_confidence || 0 },
      trocr_recognition: {
        ...INITIAL_PAYLOAD.trocr_recognition,
        plate_text: detection.plate_text || 'UNREADABLE',
        confidence: detection.ocr_confidence || 0,
        country_code: 'IND',
        tokens: (detection.plate_text || 'UNREADABLE').split('').map((char: string) => ({
          char,
          // If we don't have per-character confidences from backend, we just fake it around the overall confidence
          prob: Math.max(0, Math.min(1, (detection.ocr_confidence || 0.95) + (Math.random() * 0.04 - 0.02)))
        }))
      },
      vehicle_classification: {
        ...INITIAL_PAYLOAD.vehicle_classification,
        category: detection.vehicle_type || 'Unknown',
      }
    };

    setCurrentSample(customSample);
    setPayload(newPayload);
    setCurrentStage(1);
  };

  useEffect(() => {
    if (allDetections.length > 0 && originalImage) {
      const img = new Image();
      img.onload = () => {
        loadDetection(allDetections[selectedDetectionIndex], originalImage, 'Uploaded Target', img.width, img.height);
      };
      img.src = originalImage;
    }
  }, [selectedDetectionIndex, allDetections, originalImage]);

  // Handle custom target upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/detect/image', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (data && data.detections && data.detections.length > 0) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const originalImageUrl = event.target.result as string;
              setOriginalImage(originalImageUrl);
              setAllDetections(data.detections);
              setSelectedDetectionIndex(0);
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert("No plates detected.");
        }
      } catch (error) {
        console.error('Detection failed', error);
        alert("Detection failed. Make sure the backend is running.");
      }
    }
  };

  const handleCaptureFrame = async (dataUrl: string) => {
    // Convert dataUrl to File
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'webcam-snap.jpg', { type: 'image/jpeg' });
    
    // Create a mock event to reuse handleFileUpload logic
    const mockEvent = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleFileUpload(mockEvent);
  };

  const handleResetSample = () => {
    setCurrentSample(SAMPLES[0]);
    setPayload({
      ...INITIAL_PAYLOAD,
      timestamp: new Date().toISOString(),
    });
    setAllDetections([]);
    setOriginalImage('');
    setCurrentStage(1);
  };

  // If in Gateway Authentication screen
  if (screenMode === 'gateway') {
    return (
      <GatewayScreen
        onAuthenticate={() => setScreenMode('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#10131a] text-[#e1e2ec] font-['Inter',sans-serif] selection:bg-[#06b6d4] selection:text-[#00424f] antialiased">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        vramUsedGb={3.2}
        vramTotalGb={80}
      />

      {/* Main Content Area (offset by left sidebar) */}
      <div className={`${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} flex flex-col min-h-screen transition-[padding] duration-300`}>
        {/* Top Header */}
        <Header
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
          }}
          onLockGateway={() => setScreenMode('gateway')}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Primary Page Canvas */}
        <main className="w-full pt-20 px-3 sm:px-6 lg:px-8 pb-12 max-w-[1740px] mx-auto flex flex-col gap-5 sm:gap-6">
          {/* Top System Breadcrumb & Global Telemetry Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-[#141822]/70 backdrop-blur-xl p-3 sm:p-4 rounded-xl border border-[#272a32] shadow-lg shadow-black/40">
            {/* Breadcrumb & Endpoint */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 font-['JetBrains_Mono',monospace] text-[10px] sm:text-[11px] uppercase text-[#869397]">
                <span className="text-[#4cd7f6] font-semibold">Engine</span>
                <span>/</span>
                <span>Inference Core</span>
                <span>/</span>
                <span className="text-[#e1e2ec] font-semibold truncate max-w-[180px] xs:max-w-xs sm:max-w-none">
                  ALPR Multistage
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1d1f27] border border-[#272a32] px-2.5 py-0.5 sm:py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                <span className="font-['JetBrains_Mono',monospace] text-[10px] sm:text-[11px] text-[#4cd7f6] truncate">
                  POST :8000/detect/image
                </span>
              </div>
            </div>

            {/* Global Telemetry & Actions */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6">
              {allDetections.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#869397] font-['JetBrains_Mono',monospace] uppercase">Plates:</span>
                  <select 
                    value={selectedDetectionIndex} 
                    onChange={(e) => setSelectedDetectionIndex(Number(e.target.value))}
                    className="bg-[#1d1f27] border border-[#272a32] text-[#e1e2ec] text-[11px] font-['JetBrains_Mono',monospace] rounded px-2 py-1 outline-none"
                  >
                    {allDetections.map((det, idx) => (
                      <option key={idx} value={idx}>Plate {idx + 1} ({det.plate_text || '??'})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-4 text-[11px] font-['JetBrains_Mono',monospace]">
                <div className="flex flex-col">
                  <span className="text-[#869397] uppercase text-[10px]">E2E Latency</span>
                  <span className="font-semibold text-[#4cd7f6]">42.8 ms</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#869397] uppercase text-[10px]">VRAM Alloc</span>
                  <span className="text-[#e1e2ec]">3.2 GB / 80 GB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#869397] uppercase text-[10px]">Precision</span>
                  <span className="text-[#d0bcff]">FP16-TensorRT</span>
                </div>
              </div>

              {/* Upload & Load Sample Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] transition-all text-[11px] sm:text-[12px] font-medium cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#869397]" />
                  <span>Upload Target</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetSample}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-semibold shadow-md shadow-[#4cd7f6]/20 hover:bg-[#6be0fb] transition-all text-[11px] sm:text-[12px] cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Load Sample</span>
                </button>
              </div>
            </div>
          </div>

            {/* View Switcher Handler */}
          {currentView === 'inference-playground' && (
            <div className="flex flex-col gap-6">
              {/* Stepper Navigation Header */}
              <StageStepper
                currentStage={currentStage}
                onSelectStage={(st) => setCurrentStage(st)}
              />

              {/* Main Interactive Stage Panels */}
              {currentStage === 1 && (
                <YoloDetectionStage
                  payload={payload}
                  sample={currentSample}
                  onNext={() => setCurrentStage(2)}
                  imageRef={imageRef}
                  onCaptureFrame={handleCaptureFrame}
                />
              )}

              {currentStage === 2 && (
                <TrocrRecognitionStage
                  payload={payload}
                  sample={currentSample}
                  onPrev={() => setCurrentStage(1)}
                  onNext={() => setCurrentStage(3)}
                  imageRef={imageRef}
                />
              )}

              {currentStage === 3 && (
                <VehicleCnnStage
                  payload={payload}
                  sample={currentSample}
                  onPrev={() => setCurrentStage(2)}
                  onNext={() => setCurrentStage(4)}
                />
              )}

              {currentStage === 4 && (
                <TelemetryExportStage
                  payload={payload}
                  sample={currentSample}
                  onPrev={() => setCurrentStage(3)}
                  onReset={() => setCurrentStage(1)}
                />
              )}
            </div>
          )}

          {currentView === 'model-pipeline' && <PipelineGraphView />}
          {currentView === 'model-zoo' && <ModelZooView />}
          {currentView === 'cluster-telemetry' && <ClusterStatusView />}
          {currentView === 'api-docs' && <ApiDocsView />}
        </main>
      </div>
    </div>
  );
}
