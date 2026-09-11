import React from 'react';
import { GitFork, ArrowRight, CheckCircle2, Zap, Database } from 'lucide-react';

export const PipelineGraphView: React.FC = () => {
  const nodes = [
    {
      id: 'input',
      title: 'Raw Stream Ingestion',
      subtitle: 'RTSP / HTTP Tensor Stream',
      spec: '1920x1080 @ 60 FPS (H.265 / NVDEC)',
      status: 'ONLINE',
      color: '#4cd7f6',
    },
    {
      id: 'yolo',
      title: 'Stage 1: YOLOv8x Localizer',
      subtitle: 'Dual Anchor Bounding Box Extractor',
      spec: 'Anchor 1: Vehicle | Anchor 2: LP (14.2ms)',
      status: 'ACTIVE',
      color: '#4cd7f6',
    },
    {
      id: 'crop',
      title: 'Tensor Slicer & STN-v2',
      subtitle: 'Spatial Transformer & Affine Warp',
      spec: 'Crop [46x48] -> Normalized [360x150] (1.8ms)',
      status: 'ACTIVE',
      color: '#2fd9f4',
    },
    {
      id: 'ocr_cnn',
      title: 'Stage 2 & 3: Neural Fusion',
      subtitle: 'TrOCR-Base + EfficientNet-B4 Ensemble',
      spec: 'Transcription (18.6ms) + Vehicle CNN (10.0ms)',
      status: 'ACTIVE',
      color: '#d0bcff',
    },
    {
      id: 'output',
      title: 'Stage 4: Telemetry Sink',
      subtitle: 'Kafka Stream & HTTPS Webhook Node',
      spec: 'JSON Payload / 23.3 FPS throughput (42.8ms total)',
      status: 'STREAMING',
      color: '#4cd7f6',
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#141822]/80 backdrop-blur-2xl p-6 rounded-2xl border border-[#272a32] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-[#4cd7f6]" />
              <h2 className="text-[20px] font-bold text-[#e1e2ec]">Neural ALPR Pipeline DAG Graph</h2>
            </div>
            <p className="text-[13px] text-[#869397] mt-1">
              End-to-end directed acyclic graph topology executing across NVIDIA A100 TensorRT unified runtime.
            </p>
          </div>
          <div className="flex items-center gap-3 font-['JetBrains_Mono',monospace] text-[11px]">
            <span className="px-3 py-1.5 rounded-lg bg-[#003640] text-[#4cd7f6] border border-[#06b6d4]/40 font-semibold">
              PIPELINE STATE: SYNCHRONIZED
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#1d1f27] text-[#e1e2ec] border border-[#272a32]">
              NODES: 5 ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* DAG Flow Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="relative bg-[#141822]/90 border border-[#272a32] hover:border-[#4cd7f6]/50 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono',monospace] text-[#869397] mb-2">
                <span>NODE 0{index + 1}</span>
                <span className="text-[#4cd7f6] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-ping" />
                  {node.status}
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-[#e1e2ec] group-hover:text-[#4cd7f6] transition-colors">
                {node.title}
              </h3>
              <p className="text-[12px] text-[#869397] mt-1">
                {node.subtitle}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0b0e15] border border-[#1d1f27] font-['JetBrains_Mono',monospace] text-[11px] text-[#bcc9cd]">
              {node.spec}
            </div>

            {index < nodes.length - 1 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#1d1f27] border border-[#32353d] items-center justify-center text-[#4cd7f6]">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Architecture Parameters Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-['JetBrains_Mono',monospace]">
        <div className="bg-[#141822]/80 border border-[#272a32] p-4 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#869397] uppercase">
            <span>Tensor Memory Bus</span>
            <Database className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="text-[20px] font-bold text-[#e1e2ec] mt-1">1.93 TB/s</div>
          <p className="text-[11px] text-[#869397] mt-1">HBM2e unified memory on-chip throughput</p>
        </div>

        <div className="bg-[#141822]/80 border border-[#272a32] p-4 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#869397] uppercase">
            <span>E2E Ingestion Latency</span>
            <Zap className="w-4 h-4 text-[#2fd9f4]" />
          </div>
          <div className="text-[20px] font-bold text-[#4cd7f6] mt-1">42.8 ms</div>
          <p className="text-[11px] text-[#869397] mt-1">From raw frame DMA buffer to JSON telemetry</p>
        </div>

        <div className="bg-[#141822]/80 border border-[#272a32] p-4 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-[#869397] uppercase">
            <span>Concurrency Limits</span>
            <CheckCircle2 className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <div className="text-[20px] font-bold text-[#d0bcff] mt-1">16 Streams</div>
          <p className="text-[11px] text-[#869397] mt-1">Parallel RTSP feeds on single Node-04 rig</p>
        </div>
      </div>
    </div>
  );
};
