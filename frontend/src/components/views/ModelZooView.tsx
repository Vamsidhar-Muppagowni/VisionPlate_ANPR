import React, { useState } from 'react';
import { Layers, Download, Check, RefreshCw, Cpu, Database, AlertCircle } from 'lucide-react';
import { MODEL_ZOO_ITEMS } from '../../data/mockData';

export const ModelZooView: React.FC = () => {
  const [models, setModels] = useState(MODEL_ZOO_ITEMS);
  const [reloadingId, setReloadingId] = useState<string | null>(null);

  const handleWarmReload = (id: string) => {
    setReloadingId(id);
    setTimeout(() => {
      setReloadingId(null);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#141822]/80 backdrop-blur-2xl p-6 rounded-2xl border border-[#272a32] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#4cd7f6]" />
            <h2 className="text-[20px] font-bold text-[#e1e2ec]">Model Zoo &amp; Neural Weights Registry</h2>
          </div>
          <p className="text-[13px] text-[#869397] mt-1">
            Resident ONNX, PyTorch, and TensorRT compiled model engines mapped to A100-SXM4 unified VRAM.
          </p>
        </div>
        <div className="flex items-center gap-3 font-['JetBrains_Mono',monospace] text-[11px]">
          <span className="px-3 py-1.5 rounded-lg bg-[#1d1f27] border border-[#272a32] text-[#e1e2ec]">
            TOTAL VRAM OCCUPIED: <strong className="text-[#4cd7f6]">3.2 GB / 80 GB</strong>
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-[#141822]/90 border border-[#272a32] hover:border-[#4cd7f6]/40 p-5 rounded-xl flex flex-col justify-between gap-4 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between font-['JetBrains_Mono',monospace] text-[11px] mb-2">
                <span className="px-2 py-0.5 rounded bg-[#0b0e15] border border-[#272a32] text-[#4cd7f6]">
                  {model.precision}
                </span>
                <span className="text-[#4cd7f6] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                  {model.status}
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-[#e1e2ec] font-['JetBrains_Mono',monospace]">
                {model.name}
              </h3>
              <p className="text-[13px] text-[#869397] mt-1">
                {model.task}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 font-['JetBrains_Mono',monospace] text-[11px] bg-[#0b0e15] border border-[#1d1f27] p-2.5 rounded-lg">
              <div>
                <span className="text-[#869397] block text-[10px]">PARAMS</span>
                <span className="font-semibold text-[#e1e2ec]">{model.params}</span>
              </div>
              <div>
                <span className="text-[#869397] block text-[10px]">VRAM</span>
                <span className="font-semibold text-[#d0bcff]">{model.vram}</span>
              </div>
              <div>
                <span className="text-[#869397] block text-[10px]">LATENCY</span>
                <span className="font-semibold text-[#4cd7f6]">{model.latency}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1d1f27] text-[12px]">
              <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#869397]">
                {model.framework}
              </span>
              <button
                type="button"
                onClick={() => handleWarmReload(model.id)}
                disabled={reloadingId === model.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] hover:text-[#4cd7f6] transition-colors cursor-pointer text-[12px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reloadingId === model.id ? 'animate-spin text-[#4cd7f6]' : ''}`} />
                <span>{reloadingId === model.id ? 'Recompiling TRT...' : 'Warm Reload'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
