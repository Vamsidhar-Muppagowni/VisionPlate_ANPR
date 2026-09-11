export type AppView = 'inference-playground' | 'model-pipeline' | 'model-zoo' | 'cluster-telemetry' | 'api-docs';

export type PipelineStage = 1 | 2 | 3 | 4;

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  confidence: number;
}

export interface TokenProb {
  char: string;
  prob: number;
}

export interface DetectionPayload {
  timestamp: string;
  pipeline_version: string;
  device: string;
  endpoint: string;
  bounding_box: BoundingBox;
  trocr_recognition: {
    plate_text: string;
    confidence: number;
    country_code: string;
    plate_type: string;
    skew_angle: string;
    tokens: TokenProb[];
  };
  vehicle_classification: {
    category: string;
    confidence: number;
    make_model: string;
    sub_class: string;
    oem: string;
    chassis: string;
    color_estimate: string;
    softmax_top3: Array<{ label: string; score: number }>;
  };
  benchmark_ms: {
    yolo: number;
    trocr: number;
    cnn: number;
    total_pipeline: number;
  };
}

export interface SampleTarget {
  id: string;
  name: string;
  imageUrl: string;
  vehicleCategory: string;
  vehicleModel: string;
  plateText: string;
  countryCode: string;
  bboxCoords: { x1: number; y1: number; x2: number; y2: number };
  cropRect: { sxPercent: number; syPercent: number; swPercent: number; shPercent: number };
  vehicleBBox: { left: string; top: string; width: string; height: string };
  plateBBox: { left: string; top: string; width: string; height: string };
}
