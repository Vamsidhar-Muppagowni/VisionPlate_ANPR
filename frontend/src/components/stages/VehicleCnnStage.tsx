import React from 'react';
import { ArrowLeft, ArrowRight, Car, Sparkles, Layers } from 'lucide-react';
import { DetectionPayload, SampleTarget } from '../../types';

interface VehicleCnnStageProps {
  payload: DetectionPayload;
  sample: SampleTarget;
  onPrev: () => void;
  onNext: () => void;
}

export const VehicleCnnStage: React.FC<VehicleCnnStageProps> = ({
  payload,
  sample,
  onPrev,
  onNext,
}) => {
  const { vehicle_classification, benchmark_ms } = payload;

  return (
    <section className="flex flex-col xl:flex-row gap-6 w-full animate-fadeIn">
      {/* Main Classification Canvas / Graphic */}
      <div className="flex-1 bg-[#141822]/90 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 flex flex-col justify-between border border-[#272a32] shadow-2xl shadow-black/60 relative overflow-hidden">
        <div className="flex flex-col gap-6">
          {/* Header HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1d1f27]">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-[#2fd9f4]/10 border border-[#2fd9f4]/30 text-[#2fd9f4] font-['JetBrains_Mono',monospace] text-[11px] font-semibold rounded-md">
                ENSEMBLE_CLASSIFIER
              </span>
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[12px]">
                ResNet50 + EfficientNet-B4
              </span>
            </div>
            <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#869397]">
              Vector Dim: 1,024 embeddings
            </span>
          </div>

          {/* Huge Stylized Classification Display */}
          <div className="p-6 sm:p-8 bg-[#0b0e15]/80 border border-[#1d1f27] rounded-xl relative overflow-hidden flex flex-col justify-center gap-4">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-6 top-6 flex items-center gap-2 bg-[#1d1f27]/90 border border-[#272a32] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6]" />
              <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#4cd7f6] font-semibold">
                Class Conf: {(vehicle_classification.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <span className="font-['JetBrains_Mono',monospace] text-[11px] uppercase text-[#869397] tracking-widest">
              Primary Vehicle Category
            </span>

            {/* High scale glowing gradient vehicle label */}
            <h1 className="text-[30px] xs:text-[40px] sm:text-[54px] lg:text-[64px] sm:leading-[70px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4cd7f6] via-[#2fd9f4] to-[#d0bcff] break-words">
              {vehicle_classification.category}
            </h1>


          </div>


        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-4 border-t border-[#1d1f27]">
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] transition-all flex items-center gap-2 text-[13px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to TrOCR</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-semibold hover:bg-[#6be0fb] transition-all flex items-center gap-2 shadow-md shadow-[#4cd7f6]/25 text-[13px] cursor-pointer"
          >
            <span>View Telemetry Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Attributes & Latent Features */}
      <div className="w-full xl:w-[380px] flex flex-col gap-4">
        <div className="bg-[#141822]/80 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 border border-[#272a32] shadow-xl shadow-black/40 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold text-[#e1e2ec]">Latent Embeddings</span>
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#2fd9f4] bg-[#2fd9f4]/10 border border-[#2fd9f4]/20 px-2 py-0.5 rounded">
              STAGE 3/4
            </span>
          </div>

          {/* Simulated CAM / Feature Activation Visual Block */}
          <div className="bg-[#1d1f27]/70 border border-[#272a32] p-4 rounded-xl flex flex-col gap-2">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#869397]">
              Class Activation Map (CAM)
            </span>
            <div className="h-28 rounded-lg bg-[#0b0e15] border border-[#1d1f27] relative overflow-hidden flex items-center justify-center">
              <img
                src={sample.imageUrl}
                alt="CAM visual"
                className="w-full h-full object-cover opacity-35 filter contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-purple-600/40 mix-blend-color-dodge" />
              <div className="absolute px-3 py-1 bg-[#0b0e15]/85 border border-[#272a32] backdrop-blur-sm rounded font-['JetBrains_Mono',monospace] text-[10px] text-[#4cd7f6]">
                Max Activation: C-Pillar &amp; Roofline
              </div>
            </div>
          </div>

          {/* Features Table */}
          <div className="flex flex-col gap-2 font-['JetBrains_Mono',monospace] text-[12px]">
            <div className="flex justify-between py-1.5 bg-[#0b0e15]/60 border border-[#1d1f27] px-3 rounded">
              <span className="text-[#869397] text-[11px] uppercase">CNN Latency</span>
              <span className="text-[#e1e2ec]">{benchmark_ms.cnn} ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
