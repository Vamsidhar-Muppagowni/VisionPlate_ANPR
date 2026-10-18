import { DetectionPayload, SampleTarget } from '../types';

export const AUDI_Q7_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyAkVMPvQsXWsFvnd04VpSHB9NhiqD58grJ07Z9p7xQWwE3L2cltyslBld75nBOUZPNJtriMi9mnYy9Az0pCmY5nyy8-KjQexpjG9Q2Lyr2hi8T6ir5LAwDF305Hfspe1EHMFYBBB4K1FdXT5Mjf9zjUDyWrGRdD8YlptYZdHWAfA6Io-eOUlDBubxW-F52w9uIp0n10sKU7G53U0AWxBJAayoiDOJgdBRhAbyAhs2_ZNFta0713A';
export const PLATE_VISION_LOGO = 'https://lh3.googleusercontent.com/aida/AEtjO1WssnEOe6CkpxOs54DGFUPu601NAsB0rihi0pQBN-XBWUgrDXweeAan_GlKIJcUq3cV8FvNM85HYUpT8zuYguIyxFEKGA4wFvlv91gPv0Z8BcNqNUMoRc78lYErbxjrG7wHHobxsL7DmqEUp9ThwbBQx5PED4uaRfqgga5jDwbPb36i4MJavR08dotZEbgYzdgLmecrWwfEFb_oRFscsCOKJL3v0JD2aPdHkKwOMm_wnnrCPZLs02B7Hg';
export const SPECTRA_LOGO = PLATE_VISION_LOGO;

export const SAMPLES: SampleTarget[] = [
  {
    id: 'audi-q7',
    name: 'Audi Q7 (Dusk Urban)',
    imageUrl: AUDI_Q7_IMAGE,
    vehicleCategory: 'LUXURY SUV',
    vehicleModel: 'Audi Q7 (4M Series)',
    plateText: 'AB 123 CT',
    countryCode: 'DE',
    bboxCoords: { x1: 172, y1: 494, x2: 218, y2: 542 },
    cropRect: { sxPercent: 0.165, syPercent: 0.485, swPercent: 0.055, shPercent: 0.048 },
    vehicleBBox: { left: '13%', top: '25%', width: '70%', height: '55%' },
    plateBBox: { left: '16.5%', top: '48.5%', width: '5.5%', height: '4.8%' },
  }
];

export const INITIAL_PAYLOAD: DetectionPayload = {
  timestamp: new Date().toISOString(),
  pipeline_version: 'v3.4.1-rc',
  device: 'NVIDIA A100-SXM4 (Node 04)',
  endpoint: 'http://localhost:8000/detect/image',
  bounding_box: {
    x1: 172,
    y1: 494,
    x2: 218,
    y2: 542,
    width: 46,
    height: 48,
    confidence: 0.987,
  },
  trocr_recognition: {
    plate_text: 'AB 123 CT',
    confidence: 0.994,
    country_code: 'DE',
    plate_type: 'Rectangular EU (DIN 74069)',
    skew_angle: '0.2°',
    tokens: [
      { char: 'A', prob: 0.998 },
      { char: 'B', prob: 0.996 },
      { char: '1', prob: 0.991 },
      { char: '2', prob: 0.995 },
      { char: '3', prob: 0.997 },
      { char: 'C', prob: 0.992 },
      { char: 'T', prob: 0.994 },
    ],
  },
  vehicle_classification: {
    category: 'LUXURY SUV',
    confidence: 0.978,
    make_model: 'Audi Q7 (4M Series)',
    sub_class: 'Full-Size Executive Crossover',
    oem: 'Audi AG',
    chassis: '5-Door Wagon-SUV',
    color_estimate: 'Daytona Grey Metallic',
    softmax_top3: [
      { label: 'Luxury SUV', score: 0.978 },
      { label: 'Station Wagon / Avant', score: 0.018 },
      { label: 'Sedan / Saloon', score: 0.004 },
    ],
  },
  benchmark_ms: {
    yolo: 14.2,
    trocr: 18.6,
    cnn: 10.0,
    total_pipeline: 42.8,
  },
};

export const MODEL_ZOO_ITEMS = [
  {
    id: 'yolo-v8x',
    name: 'YOLOv8x-ALPR-v4',
    task: 'Vehicle & Plate Localization',
    framework: 'ONNX / TensorRT 10.1',
    precision: 'FP16',
    params: '68.2M',
    vram: '1.4 GB',
    latency: '14.2 ms',
    status: 'WARMED & RESIDENT',
  },
  {
    id: 'trocr-base',
    name: 'microsoft/trocr-base-stage1',
    task: 'Optical Sequence Transcription',
    framework: 'PyTorch / TensorRT ViT',
    precision: 'FP16',
    params: '334.8M',
    vram: '1.2 GB',
    latency: '18.6 ms',
    status: 'WARMED & RESIDENT',
  },
  {
    id: 'effnet-b4',
    name: 'EfficientNet-B4 + ResNet50 Ensemble',
    task: 'Vehicle Fine-Grained Make & Class',
    framework: 'CUDA FP16 TensorRT Engine',
    precision: 'FP16',
    params: '44.7M',
    vram: '0.6 GB',
    latency: '10.0 ms',
    status: 'WARMED & RESIDENT',
  },
  {
    id: 'spatial-stn',
    name: 'Affine Spatial Transformer (STN-v2)',
    task: 'Plate Skew & Perspective Rectification',
    framework: 'TorchScript JIT',
    precision: 'FP32',
    params: '4.1M',
    vram: '0.1 GB',
    latency: '1.8 ms',
    status: 'ACTIVE',
  },
  {
    id: 'srgan-gen',
    name: 'SRGAN Super-Resolution Generator',
    task: '4x License Plate Super-Resolution (CVPR)',
    framework: 'PyTorch / CUDA (Weights: srgan_gen_best.pth)',
    precision: 'FP16',
    params: '934.7K',
    vram: '0.12 GB',
    latency: '10.6 ms',
    status: 'ACTIVE & RESIDENT',
  },
  {
    id: 'dncnn-denoiser',
    name: 'DnCNN-17 Denoising Network',
    task: 'CCTV Sensor & Low-Light Noise Removal',
    framework: 'PyTorch / CUDA (Weights: dncnn_best.pth)',
    precision: 'FP16',
    params: '556.1K',
    vram: '0.08 GB',
    latency: '6.7 ms',
    status: 'ACTIVE & RESIDENT',
  },
];
