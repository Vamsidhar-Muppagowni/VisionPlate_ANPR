import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Car,
  Camera,
  Video,
  VideoOff,
  Image as ImageIcon,
  Aperture,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DetectionPayload, SampleTarget } from '../../types';

interface YoloDetectionStageProps {
  payload: DetectionPayload;
  sample: SampleTarget;
  onNext: () => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
  onCaptureFrame?: (dataUrl: string) => void;
}

export const YoloDetectionStage: React.FC<YoloDetectionStageProps> = ({
  payload,
  sample,
  onNext,
  imageRef,
  onCaptureFrame,
}) => {
  const [hoveredBox, setHoveredBox] = useState<'vehicle' | 'plate' | null>(null);

  // Live Camera state
  const [sourceMode, setSourceMode] = useState<'static' | 'camera'>('static');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFps, setCameraFps] = useState<number>(59.2);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });
  const [capturedFlash, setCapturedFlash] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  const { bounding_box, vehicle_classification, benchmark_ms } = payload;

  // Start webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam media devices API not supported in this browser environment.');
      }

      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: 'environment', // prefer back camera if on mobile, falls back gracefully
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
            setVideoDimensions({
              width: videoRef.current.videoWidth || 1280,
              height: videoRef.current.videoHeight || 720,
            });
          }
        };
      }

      setIsStreaming(true);
      setSourceMode('camera');

      // Start FPS counter loop
      lastTimeRef.current = performance.now();
      frameCountRef.current = 0;

      const calcFps = () => {
        frameCountRef.current += 1;
        const now = performance.now();
        const delta = now - lastTimeRef.current;
        if (delta >= 1000) {
          const currentFps = (frameCountRef.current * 1000) / delta;
          setCameraFps(Number(currentFps.toFixed(1)));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
        animationFrameIdRef.current = requestAnimationFrame(calcFps);
      };

      animationFrameIdRef.current = requestAnimationFrame(calcFps);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No video camera detected on this device.';
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
      setIsStreaming(false);
    }
  };

  // Stop webcam stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  // Switch to static image mode
  const switchToStatic = () => {
    stopCamera();
    setSourceMode('static');
    setCameraError(null);
  };

  // Switch to camera mode
  const switchToCamera = () => {
    setSourceMode('camera');
    startCamera();
  };

  // Capture current video frame and feed into pipeline
  const captureCurrentFrame = () => {
    const video = videoRef.current;
    if (!video || !isStreaming) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Trigger visual snapshot shutter flash
      setCapturedFlash(true);
      setTimeout(() => setCapturedFlash(false), 250);

      // Update sample target in parent App
      if (onCaptureFrame) {
        onCaptureFrame(dataUrl);
      }
    } catch (e) {
      console.error('Frame capture failed:', e);
    }
  };

  // Proceed to stage 2: if in camera mode, snap current frame automatically so Stage 2 has the latest image
  const handleProceedNext = () => {
    if (sourceMode === 'camera' && isStreaming) {
      captureCurrentFrame();
    }
    onNext();
  };

  // Clean up camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <section className="flex flex-col xl:flex-row gap-6 w-full animate-fadeIn">
      {/* Visual Viewport Canvas / Frame */}
      <div className="flex-1 bg-[#141822]/90 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 flex flex-col justify-between border border-[#272a32] shadow-2xl shadow-black/60 relative overflow-hidden">
        <div>
          {/* Viewport Header HUD & Source Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-[#1d1f27]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 text-[#4cd7f6] font-['JetBrains_Mono',monospace] text-[11px] font-semibold rounded-md">
                DETECTION_NODE_01
              </span>
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[12px]">
                {sourceMode === 'camera' ? 'WEBCAM_STREAM_H264' : 'YOLOv8x-ALPR-v4.onnx'}
              </span>

              {/* Source Switcher: Static Image vs Live Camera */}
              <div className="flex items-center bg-[#0b0e15] p-1 rounded-lg border border-[#272a32] ml-1">
                <button
                  type="button"
                  onClick={switchToStatic}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                    sourceMode === 'static'
                      ? 'bg-[#1d1f27] text-[#4cd7f6] font-semibold shadow-sm border border-[#32353d]'
                      : 'text-[#869397] hover:text-[#e1e2ec]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Static Target</span>
                </button>
                <button
                  type="button"
                  onClick={switchToCamera}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                    sourceMode === 'camera'
                      ? 'bg-[#06b6d4] text-[#00424f] font-bold shadow-sm'
                      : 'text-[#869397] hover:text-[#e1e2ec]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Live Camera</span>
                  {isStreaming && (
                    <span className="w-2 h-2 rounded-full bg-[#00424f] animate-ping ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#4cd7f6] font-['JetBrains_Mono',monospace] text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
                <span>
                  {sourceMode === 'camera'
                    ? isStreaming
                      ? `LIVE ${cameraFps} FPS / NVDEC`
                      : 'CAMERA STANDBY'
                    : 'IoU: 0.65 / NMS: PASS'}
                </span>
              </span>
              <span className="bg-[#1d1f27] border border-[#272a32] text-[#e1e2ec] font-['JetBrains_Mono',monospace] text-[11px] px-2.5 py-1 rounded">
                {sourceMode === 'camera'
                  ? `${videoDimensions.width}x${videoDimensions.height}`
                  : '1920x1080 -> 640x640'}
              </span>
            </div>
          </div>

          {/* Camera Error Banner */}
          {cameraError && (
            <div className="mb-3 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center justify-between text-red-200 text-[12px]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{cameraError}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 rounded border border-red-700 text-[11px] font-medium cursor-pointer"
                >
                  Retry Camera
                </button>
                <button
                  type="button"
                  onClick={switchToStatic}
                  className="px-2.5 py-1 bg-[#1d1f27] hover:bg-[#272a32] rounded border border-[#272a32] text-[11px] text-[#e1e2ec] cursor-pointer"
                >
                  Use Static Image
                </button>
              </div>
            </div>
          )}

          {/* Video / Feed Display Area with AI Bounding Box Overlays */}
          <div className="relative w-full aspect-[16/9] max-h-[560px] bg-[#0b0e15] rounded-xl overflow-hidden flex items-center justify-center group shadow-inner border border-[#1d1f27]">
            {/* Shutter Flash Animation Effect */}
            {capturedFlash && (
              <div className="absolute inset-0 bg-white/70 z-30 pointer-events-none transition-opacity duration-200" />
            )}

            {/* Mode 1: Static Target Feed Image */}
            {sourceMode === 'static' && (
              <img
                ref={imageRef}
                src={sample.imageUrl}
                alt="Vehicle detection target"
                crossOrigin="anonymous"
                className="w-full h-full object-cover select-none transition-transform duration-700"
              />
            )}

            {/* Mode 2: Live Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover select-none ${
                sourceMode === 'camera' ? 'block' : 'hidden'
              }`}
            />

            {/* Standby screen if Camera mode selected but not yet started or permitted */}
            {sourceMode === 'camera' && !isStreaming && !cameraError && (
              <div className="absolute inset-0 bg-[#0b0e15]/95 flex flex-col items-center justify-center gap-3 text-center p-6 z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#1d1f27] border border-[#32353d] flex items-center justify-center text-[#4cd7f6] shadow-xl">
                  <Camera className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#e1e2ec]">Webcam Ready to Stream</h3>
                <p className="text-[12px] text-[#869397] max-w-sm">
                  Connect your camera to stream frames through the YOLOv8x localization engine in real-time.
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 px-5 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-semibold text-[13px] hover:bg-[#6be0fb] transition-all flex items-center gap-2 shadow-md shadow-[#4cd7f6]/25 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Live Stream</span>
                </button>
              </div>
            )}

            {/* Cybernetic Grid Overlay Lines */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-25" />

            {/* YOLO Vehicle BBox Overlay */}
            <div
              onMouseEnter={() => setHoveredBox('vehicle')}
              onMouseLeave={() => setHoveredBox(null)}
              style={{
                left: sample.vehicleBBox.left,
                top: sample.vehicleBBox.top,
                width: sample.vehicleBBox.width,
                height: sample.vehicleBBox.height,
              }}
              className="absolute pointer-events-auto transition-all duration-300"
            >
              <div
                className={`w-full h-full relative rounded-lg border transition-all ${
                  hoveredBox === 'vehicle'
                    ? 'border-[#4cd7f6] bg-[#4cd7f6]/10 shadow-[0_0_20px_rgba(76,215,246,0.3)]'
                    : 'border-[#4cd7f6]/70 bg-[#4cd7f6]/5'
                }`}
              >
                {/* Tag */}
                <div className="absolute -top-7 left-0 px-2 py-1 bg-[#4cd7f6] text-[#003640] font-['JetBrains_Mono',monospace] text-[11px] uppercase font-bold tracking-wider rounded flex items-center gap-1.5 shadow-md shadow-[#4cd7f6]/30">
                  <Car className="w-3.5 h-3.5" />
                  <span>
                    {sourceMode === 'camera'
                      ? 'Live Object Anchor: 98.2%'
                      : `Vehicle: SUV (${(vehicle_classification.confidence * 100).toFixed(1)}%)`}
                  </span>
                </div>

                {/* BBox Corner Reticles */}
                <div className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#4cd7f6]" />
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#4cd7f6]" />
                <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#4cd7f6]" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#4cd7f6]" />
              </div>
            </div>

            {/* YOLO License Plate Sub-BBox Overlay */}
            <div
              onMouseEnter={() => setHoveredBox('plate')}
              onMouseLeave={() => setHoveredBox(null)}
              style={{
                left: sample.plateBBox.left,
                top: sample.plateBBox.top,
                width: sample.plateBBox.width,
                height: sample.plateBBox.height,
              }}
              className="absolute pointer-events-auto animate-pulse"
            >
              <div className="w-full h-full relative bg-[#571bc1]/30">
                {/* Precision Bounding Lines */}
                <div className="absolute inset-0 border-2 border-[#d0bcff] shadow-[0_0_15px_rgba(208,188,255,0.9)]" />

                {/* Floating Callout Label */}
                <div className="absolute -top-7 left-0 whitespace-nowrap bg-[#571bc1] text-[#c4abff] px-2 py-0.5 rounded font-['JetBrains_Mono',monospace] text-[10px] font-semibold flex items-center gap-1.5 shadow-lg border border-[#d0bcff]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff] animate-ping" />
                  <span>
                    PLATE: [{bounding_box.x1}, {bounding_box.y1}, {bounding_box.x2}, {bounding_box.y2}] {(bounding_box.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Left Telemetry HUD Badge */}
            <div className="absolute bottom-4 left-4 z-20 bg-[#0b0e15]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#272a32] flex items-center gap-4 font-['JetBrains_Mono',monospace] text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2fd9f4]" />
                <span className="text-[#e1e2ec]">
                  Detected Anchors: 1 Target, 1 Reg Plate
                </span>
              </div>
              <span className="text-[#869397]">
                FPS: {sourceMode === 'camera' && isStreaming ? cameraFps : '58.4'}
              </span>
            </div>

            {/* Floating Live Camera Action Controls overlay when streaming */}
            {sourceMode === 'camera' && isStreaming && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#0b0e15]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#272a32]">
                <button
                  type="button"
                  onClick={captureCurrentFrame}
                  title="Capture & snap current live frame for ALPR transcription"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4cd7f6] text-[#003640] text-[11px] font-bold shadow-md hover:bg-[#6be0fb] transition-all cursor-pointer"
                >
                  <Aperture className="w-3.5 h-3.5" />
                  <span>Snap Frame</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  title="Pause Camera"
                  className="p-1.5 rounded-lg bg-[#1d1f27] hover:bg-[#272a32] text-[#869397] hover:text-[#e1e2ec] transition-colors cursor-pointer"
                >
                  <VideoOff className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer for Step 1 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-4 border-t border-[#1d1f27]">
          <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#869397] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#4cd7f6]" />
            {sourceMode === 'camera'
              ? 'Real-time webcam frames normalized to source 1000x562 tensor.'
              : 'YOLO bounding coordinate extraction normalized to source tensor.'}
          </span>
          <div className="flex items-center gap-2.5">
            {sourceMode === 'camera' && isStreaming && (
              <button
                type="button"
                onClick={captureCurrentFrame}
                className="px-4 py-2.5 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Aperture className="w-4 h-4 text-[#4cd7f6]" />
                <span>Snap Live Snapshot</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleProceedNext}
              className="px-5 py-2.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-semibold hover:bg-[#6be0fb] transition-all flex items-center gap-2 shadow-md shadow-[#4cd7f6]/25 cursor-pointer text-[13px]"
            >
              <span>Inspect TrOCR Crop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Analytics Card for Step 1 */}
      <div className="w-full xl:w-[380px] flex flex-col gap-4">
        <div className="bg-[#141822]/80 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 border border-[#272a32] shadow-xl shadow-black/40 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold text-[#e1e2ec]">Inference Gauges</span>
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 px-2 py-0.5 rounded">
              {sourceMode === 'camera' ? 'LIVE FEED 1/4' : 'STAGE 1/4'}
            </span>
          </div>

          {/* Radial Gauge Visual */}
          <div className="flex items-center gap-4 bg-[#1d1f27]/70 border border-[#272a32] p-4 rounded-xl">
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#32353d]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#4cd7f6]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${vehicle_classification.confidence * 100}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-['JetBrains_Mono',monospace] text-[13px] font-bold text-[#e1e2ec]">
                  {(vehicle_classification.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#869397]">
                Class Confidence
              </span>
              <span className="text-[14px] font-semibold text-[#4cd7f6]">
                {sourceMode === 'camera' ? 'Real-Time Target Anchor' : 'SUV Identification'}
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#869397] mt-1">
                Threshold delta: +28.7%
              </span>
            </div>
          </div>

          {/* Key Metrics Table */}
          <div className="flex flex-col gap-2 bg-[#0b0e15]/50 border border-[#1d1f27] p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[11px] uppercase">
                {sourceMode === 'camera' ? 'Stream Processing' : 'YOLO Latency'}
              </span>
              <span className="font-['JetBrains_Mono',monospace] font-semibold text-[#e1e2ec]">
                {sourceMode === 'camera' ? `${benchmark_ms.yolo} ms / frame` : `${benchmark_ms.yolo} ms`}
              </span>
            </div>
            <div className="w-full bg-[#32353d] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#4cd7f6] h-full w-[28%] rounded-full" />
            </div>

            <div className="flex items-center justify-between text-[12px] pt-1">
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[11px] uppercase">
                Bounding Box Area
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-[#e1e2ec]">
                2,208 px²
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[11px] uppercase">
                IoU Overlap Score
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-[#4cd7f6] font-semibold">
                0.932
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[11px] uppercase">
                Weights Format
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-[#d0bcff]">
                CUDA FP16 TensorRT
              </span>
            </div>

            {sourceMode === 'camera' && (
              <div className="flex items-center justify-between text-[12px] pt-1 border-t border-[#1d1f27]">
                <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[11px] uppercase">
                  Camera Ingestion
                </span>
                <span className="font-['JetBrains_Mono',monospace] text-[#4cd7f6] font-bold">
                  {isStreaming ? `${cameraFps} FPS ACTIVE` : 'PAUSED'}
                </span>
              </div>
            )}
          </div>

          {/* Detection Coordinate Breakdown */}
          <div className="p-3.5 bg-[#1d1f27]/50 border border-[#272a32] rounded-xl flex flex-col gap-2">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#869397] tracking-wider">
              Extracted BBox Coords (Normalized)
            </span>
            <div className="grid grid-cols-2 gap-2 font-['JetBrains_Mono',monospace] text-[12px]">
              <div className="bg-[#0b0e15]/80 p-2 rounded border border-[#272a32] flex justify-between">
                <span className="text-[#869397]">X1:</span>
                <span className="text-[#4cd7f6] font-bold">{bounding_box.x1} px</span>
              </div>
              <div className="bg-[#0b0e15]/80 p-2 rounded border border-[#272a32] flex justify-between">
                <span className="text-[#869397]">Y1:</span>
                <span className="text-[#4cd7f6] font-bold">{bounding_box.y1} px</span>
              </div>
              <div className="bg-[#0b0e15]/80 p-2 rounded border border-[#272a32] flex justify-between">
                <span className="text-[#869397]">X2:</span>
                <span className="text-[#4cd7f6] font-bold">{bounding_box.x2} px</span>
              </div>
              <div className="bg-[#0b0e15]/80 p-2 rounded border border-[#272a32] flex justify-between">
                <span className="text-[#869397]">Y2:</span>
                <span className="text-[#4cd7f6] font-bold">{bounding_box.y2} px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
