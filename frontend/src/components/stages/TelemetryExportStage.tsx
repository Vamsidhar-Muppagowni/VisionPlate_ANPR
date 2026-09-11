import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Send, RotateCcw, FileText, Code2 } from 'lucide-react';
import { DetectionPayload, SampleTarget } from '../../types';

interface TelemetryExportStageProps {
  payload: DetectionPayload;
  sample: SampleTarget;
  onPrev: () => void;
  onReset: () => void;
}

export const TelemetryExportStage: React.FC<TelemetryExportStageProps> = ({
  payload,
  sample,
  onPrev,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'json'>('summary');
  const [copied, setCopied] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const { bounding_box, trocr_recognition, vehicle_classification, benchmark_ms } = payload;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWebhook = () => {
    setWebhookStatus('sending');
    setTimeout(() => {
      setWebhookStatus('sent');
      setTimeout(() => setWebhookStatus('idle'), 2500);
    }, 700);
  };

  return (
    <section className="flex flex-col xl:flex-row gap-6 w-full animate-fadeIn">
      {/* Dual Column View: Annotated Image Preview + Telemetry Table */}
      <div className="flex-1 bg-[#141822]/90 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 flex flex-col justify-between border border-[#272a32] shadow-2xl shadow-black/60 relative">
        <div className="flex flex-col gap-6">
          {/* Header HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1d1f27]">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-[#4cd7f6] text-[#003640] font-['JetBrains_Mono',monospace] text-[11px] font-bold rounded-md">
                PIPELINE COMPLETE
              </span>
              <span className="text-[#869397] font-['JetBrains_Mono',monospace] text-[12px]">
                Total Execution: {benchmark_ms.total_pipeline}ms
              </span>
            </div>

            {/* Tab Switcher for Summary / Raw JSON */}
            <div className="flex items-center bg-[#0b0e15] p-1 rounded-lg border border-[#272a32]">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-[#06b6d4] text-[#00424f] font-semibold'
                    : 'text-[#869397] hover:text-[#e1e2ec]'
                }`}
              >
                Telemetry Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-[#06b6d4] text-[#00424f] font-semibold'
                    : 'text-[#869397] hover:text-[#e1e2ec]'
                }`}
              >
                Raw JSON Payload
              </button>
            </div>
          </div>

          {/* Tab 1: Executive Telemetry Summary Grid */}
          {activeTab === 'summary' ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Visual Stack */}
              <div className="w-full lg:w-5/12 flex flex-col gap-3.5">
                <div className="relative w-full aspect-[16/10] bg-[#0b0e15] rounded-xl overflow-hidden border border-[#272a32] shadow-md">
                  <img
                    src={sample.imageUrl}
                    alt="Final inspection frame"
                    className="w-full h-full object-cover"
                  />
                  {/* Sub BBox indicator on plate */}
                  <div
                    style={{
                      left: sample.plateBBox.left,
                      top: sample.plateBBox.top,
                      width: sample.plateBBox.width,
                      height: sample.plateBBox.height,
                    }}
                    className="absolute border-2 border-[#d0bcff] shadow-[0_0_12px_#d0bcff]"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#0b0e15]/85 border border-[#272a32] px-2 py-1 rounded font-['JetBrains_Mono',monospace] text-[10px] text-[#4cd7f6]">
                    Annotated Frame
                  </div>
                </div>

                {/* Cropped Tag Mini Visual */}
                <div className="p-4 bg-[#1d1f27]/70 border border-[#272a32] rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#869397]">
                      Validated Plate String
                    </span>
                    <span className="font-['JetBrains_Mono',monospace] text-[26px] font-black text-[#e1e2ec] tracking-wider mt-0.5">
                      {trocr_recognition.plate_text}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#571bc1]/20 border border-[#d0bcff]/30 text-[#d0bcff] font-['JetBrains_Mono',monospace] text-[11px] font-bold">
                    {(trocr_recognition.confidence * 100).toFixed(1)}% VERIFIED
                  </div>
                </div>
              </div>

              {/* Right Telemetry Parameters Data Table */}
              <div className="w-full lg:w-7/12 flex flex-col bg-[#0b0e15]/60 border border-[#1d1f27] rounded-xl p-4 shadow-inner overflow-x-auto">
                <table className="w-full text-left font-['JetBrains_Mono',monospace] text-[12px]">
                  <thead>
                    <tr className="text-[#869397] text-[10px] uppercase border-b border-[#272a32]">
                      <th className="py-2 px-3 font-medium">Pipeline Field</th>
                      <th className="py-2 px-3 font-medium">Inference Output</th>
                      <th className="py-2 px-3 font-medium text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d1f27]">
                    <tr className="hover:bg-[#1d1f27]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#869397]">LICENSE_PLATE_RAW</td>
                      <td className="py-2.5 px-3 font-bold text-[#d0bcff]">{trocr_recognition.plate_text}</td>
                      <td className="py-2.5 px-3 text-right text-[#4cd7f6]">{(trocr_recognition.confidence * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="hover:bg-[#1d1f27]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#869397]">VEHICLE_CLASS</td>
                      <td className="py-2.5 px-3 font-bold text-[#e1e2ec]">{vehicle_classification.category}</td>
                      <td className="py-2.5 px-3 text-right text-[#4cd7f6]">{(vehicle_classification.confidence * 100).toFixed(1)}%</td>
                    </tr>

                    <tr className="hover:bg-[#1d1f27]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#869397]">BOUNDING_BOX</td>
                      <td className="py-2.5 px-3 text-[#e1e2ec]">[{bounding_box.x1}, {bounding_box.y1}, {bounding_box.x2}, {bounding_box.y2}]</td>
                      <td className="py-2.5 px-3 text-right text-[#4cd7f6]">{(bounding_box.confidence * 100).toFixed(1)}%</td>
                    </tr>

                    <tr className="hover:bg-[#1d1f27]/40 transition-colors">
                      <td className="py-2.5 px-3 text-[#869397]">PROCESSING_BACKEND</td>
                      <td className="py-2.5 px-3 text-[#e1e2ec]">NVIDIA Triton / TensorRT</td>
                      <td className="py-2.5 px-3 text-right text-[#d0bcff]">ACTIVE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Tab 2: Raw JSON Telemetry Payload View */
            <div className="w-full bg-[#0b0e15] border border-[#272a32] rounded-xl p-4 font-['JetBrains_Mono',monospace] text-[12px] text-[#4cd7f6] overflow-x-auto max-h-[380px]">
              <pre className="leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons for Step 4 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-4 border-t border-[#1d1f27]">
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] transition-all flex items-center gap-2 text-[13px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CNN</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Copy JSON */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] transition-all flex items-center gap-2 text-[13px] cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#4cd7f6]" /> : <Copy className="w-4 h-4 text-[#869397]" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
            </button>

            {/* Dispatch Webhook */}
            <button
              type="button"
              onClick={handleWebhook}
              disabled={webhookStatus === 'sending'}
              className="px-4 py-2 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#272a32] text-[#e1e2ec] transition-all flex items-center gap-2 text-[13px] cursor-pointer"
            >
              <Send className={`w-4 h-4 text-[#2fd9f4] ${webhookStatus === 'sending' ? 'animate-spin' : ''}`} />
              <span>
                {webhookStatus === 'sending'
                  ? 'Dispatching 200 OK...'
                  : webhookStatus === 'sent'
                  ? 'Webhook Sent!'
                  : 'Dispatch Webhook'}
              </span>
            </button>

            {/* Analyze New Target */}
            <button
              type="button"
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-semibold hover:bg-[#6be0fb] transition-all flex items-center gap-2 shadow-md shadow-[#4cd7f6]/25 text-[13px] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Analyze New Target</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Telemetry for Step 4 */}
      <div className="w-full xl:w-[380px] flex flex-col gap-4">
        <div className="bg-[#141822]/80 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 border border-[#272a32] shadow-xl shadow-black/40 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold text-[#e1e2ec]">Latency Profile</span>
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 px-2 py-0.5 rounded">
              FINAL REPORT
            </span>
          </div>

          {/* Pipeline Timing Stack */}
          <div className="flex flex-col gap-3 font-['JetBrains_Mono',monospace]">
            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#869397]">Stage 1: YOLO Detection</span>
                <span className="text-[#e1e2ec]">{benchmark_ms.yolo} ms</span>
              </div>
              <div className="w-full bg-[#0b0e15] h-1.5 rounded-full overflow-hidden border border-[#272a32]">
                <div className="bg-[#4cd7f6] h-full w-[33%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#869397]">Stage 2: TrOCR Inference</span>
                <span className="text-[#d0bcff]">{benchmark_ms.trocr} ms</span>
              </div>
              <div className="w-full bg-[#0b0e15] h-1.5 rounded-full overflow-hidden border border-[#272a32]">
                <div className="bg-[#d0bcff] h-full w-[43%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#869397]">Stage 3: EfficientNet CNN</span>
                <span className="text-[#2fd9f4]">{benchmark_ms.cnn} ms</span>
              </div>
              <div className="w-full bg-[#0b0e15] h-1.5 rounded-full overflow-hidden border border-[#272a32]">
                <div className="bg-[#2fd9f4] h-full w-[24%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0b0e15]/80 border border-[#272a32] rounded-xl flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#869397]">
                Total Pipeline Latency
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-[24px] font-bold text-[#4cd7f6]">
                {benchmark_ms.total_pipeline} ms
              </span>
            </div>
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#869397]">
              Throughput capacity: 23.3 FPS continuous stream
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
