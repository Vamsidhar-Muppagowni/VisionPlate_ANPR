import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Globe } from 'lucide-react';
import { INITIAL_PAYLOAD } from '../../data/mockData';

export const ApiDocsView: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  const curlCommand = `curl -X POST "http://localhost:8000/detect/image" \\
  -H "Authorization: Bearer <PLATE_VISION_RIG_JWT>" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@target_frame.jpg" \\
  -F "enable_ocr=true" \\
  -F "enable_vehicle_classification=true" \\
  -F "min_confidence=0.65"`;

  const pythonSnippet = `from plate_vision import InferenceClient

client = InferenceClient(
    endpoint="http://localhost:8000",
    api_key="secops_tensorrt_a100_v4"
)

# Dispatch synchronous multistage inference
result = client.detect_plate_and_vehicle(
    image_path="test_frame.jpg",
    precision="FP16"
)

print(f"Plate: {result.trocr.plate_text} ({result.trocr.confidence * 100:.1f}%)")
print(f"Vehicle: {result.vehicle.category} ({result.vehicle.make_model})")
print(f"Execution: {result.benchmark_ms.total_pipeline} ms")`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTestRpc = () => {
    setExecuting(true);
    setResponseOutput(null);
    setTimeout(() => {
      setExecuting(false);
      setResponseOutput(JSON.stringify(INITIAL_PAYLOAD, null, 2));
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-['Inter',sans-serif]">
      {/* Header */}
      <div className="bg-[#141822]/80 backdrop-blur-2xl p-6 rounded-2xl border border-[#272a32] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4cd7f6]" />
            <h2 className="text-[20px] font-bold text-[#e1e2ec]">Inference RPC &amp; REST Gateway API</h2>
          </div>
          <p className="text-[13px] text-[#869397] mt-1">
            Standardized endpoints for multi-camera Edge ingestion, gRPC streaming, and JSON webhooks.
          </p>
        </div>
        <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-[11px]">
          <span className="px-3 py-1.5 rounded-lg bg-[#1d1f27] border border-[#272a32] text-[#4cd7f6] font-semibold">
            PROTO: HTTP/2 + gRPC v1.62
          </span>
        </div>
      </div>

      {/* Endpoint Bar */}
      <div className="bg-[#141822]/90 border border-[#272a32] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-[#06b6d4] text-[#00424f] font-['JetBrains_Mono',monospace] text-[12px] font-bold">
            POST
          </span>
          <span className="font-['JetBrains_Mono',monospace] text-[14px] text-[#e1e2ec]">
            http://localhost:8000/detect/image
          </span>
        </div>
        <button
          type="button"
          onClick={handleTestRpc}
          disabled={executing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-semibold text-[13px] hover:bg-[#6be0fb] transition-all cursor-pointer disabled:opacity-60"
        >
          <Play className={`w-4 h-4 ${executing ? 'animate-spin' : ''}`} />
          <span>{executing ? 'Testing Endpoint...' : 'Send Live Test RPC'}</span>
        </button>
      </div>

      {/* Code Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-['JetBrains_Mono',monospace] text-[12px]">
        {/* cURL Request */}
        <div className="bg-[#141822]/90 border border-[#272a32] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1d1f27]">
            <span className="text-[#869397] text-[11px] uppercase">cURL Request</span>
            <button
              type="button"
              onClick={() => handleCopy(curlCommand, 'curl')}
              className="text-[#869397] hover:text-[#4cd7f6] flex items-center gap-1 cursor-pointer"
            >
              {copied === 'curl' ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copied === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-[#4cd7f6] overflow-x-auto leading-relaxed p-2 bg-[#0b0e15] rounded-lg border border-[#1d1f27]">
            {curlCommand}
          </pre>
        </div>

        {/* Python Client */}
        <div className="bg-[#141822]/90 border border-[#272a32] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1d1f27]">
            <span className="text-[#869397] text-[11px] uppercase">Python SDK Example</span>
            <button
              type="button"
              onClick={() => handleCopy(pythonSnippet, 'py')}
              className="text-[#869397] hover:text-[#4cd7f6] flex items-center gap-1 cursor-pointer"
            >
              {copied === 'py' ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copied === 'py' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-[#d0bcff] overflow-x-auto leading-relaxed p-2 bg-[#0b0e15] rounded-lg border border-[#1d1f27]">
            {pythonSnippet}
          </pre>
        </div>
      </div>

      {/* Live Response Panel if Triggered */}
      {responseOutput && (
        <div className="bg-[#141822]/90 border border-[#4cd7f6]/50 rounded-xl p-5 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1d1f27] font-['JetBrains_Mono',monospace]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
              <span className="text-[13px] text-[#4cd7f6] font-bold">200 OK — RPC Response</span>
            </div>
            <span className="text-[11px] text-[#869397]">Roundtrip: 4.1ms network + 42.8ms inference</span>
          </div>
          <pre className="text-[#4cd7f6] font-['JetBrains_Mono',monospace] text-[11px] overflow-x-auto p-3 bg-[#0b0e15] rounded-lg max-h-72 border border-[#1d1f27]">
            {responseOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
