from pathlib import Path
from typing import Optional
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

ROOT = Path(__file__).resolve().parents[1]
SRGAN_WEIGHTS_PATH = ROOT / "models" / "gan" / "srgan_gen_best.pth"
DNCNN_WEIGHTS_PATH = ROOT / "models" / "gan" / "dncnn_best.pth"


# =============================================================================
# Model Architectures
# =============================================================================

class ResidualBlock(nn.Module):
    """Residual block for SRGAN Generator."""
    def __init__(self, channels: int = 64):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
            nn.PReLU(),
            nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.block(x)


class UpsampleBlock(nn.Module):
    """Sub-pixel convolution upsampling block."""
    def __init__(self, in_channels: int, scale_factor: int = 2):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, in_channels * scale_factor ** 2, kernel_size=3, padding=1),
            nn.PixelShuffle(scale_factor),
            nn.PReLU(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)


class SRGANGenerator(nn.Module):
    """SRGAN Generator for 4x super-resolution of license plate images."""
    def __init__(self, in_channels: int = 1, num_residual_blocks: int = 8, base_channels: int = 64):
        super().__init__()
        self.initial = nn.Sequential(
            nn.Conv2d(in_channels, base_channels, kernel_size=9, padding=4),
            nn.PReLU(),
        )
        self.residual_blocks = nn.Sequential(
            *[ResidualBlock(base_channels) for _ in range(num_residual_blocks)]
        )
        self.post_residual = nn.Sequential(
            nn.Conv2d(base_channels, base_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(base_channels),
        )
        self.upsample = nn.Sequential(
            UpsampleBlock(base_channels, scale_factor=2),
            UpsampleBlock(base_channels, scale_factor=2),
        )
        self.final = nn.Conv2d(base_channels, in_channels, kernel_size=9, padding=4)
        self.tanh = nn.Tanh()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        initial = self.initial(x)
        residual = self.residual_blocks(initial)
        residual = self.post_residual(residual) + initial
        upsampled = self.upsample(residual)
        return self.tanh(self.final(upsampled))


class DnCNN(nn.Module):
    """DnCNN for removing noise from license plate images."""
    def __init__(self, depth: int = 17, n_channels: int = 64, image_channels: int = 1):
        super().__init__()
        layers = [
            nn.Conv2d(image_channels, n_channels, kernel_size=3, padding=1, bias=True),
            nn.ReLU(inplace=True),
        ]
        for _ in range(depth - 2):
            layers.append(nn.Conv2d(n_channels, n_channels, kernel_size=3, padding=1, bias=False))
            layers.append(nn.BatchNorm2d(n_channels))
            layers.append(nn.ReLU(inplace=True))
        layers.append(nn.Conv2d(n_channels, image_channels, kernel_size=3, padding=1, bias=False))
        self.dncnn = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        noise = self.dncnn(x)
        return x - noise


# =============================================================================
# Cached Engine Singletons
# =============================================================================

_srgan: Optional[SRGANGenerator] = None
_dncnn: Optional[DnCNN] = None


def get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_srgan() -> Optional[SRGANGenerator]:
    global _srgan
    if _srgan is None and SRGAN_WEIGHTS_PATH.exists():
        device = get_device()
        model = SRGANGenerator(in_channels=1, num_residual_blocks=8, base_channels=64)
        weights = torch.load(str(SRGAN_WEIGHTS_PATH), map_location=device, weights_only=True)
        model.load_state_dict(weights)
        model.to(device)
        model.eval()
        _srgan = model
    return _srgan


def get_dncnn() -> Optional[DnCNN]:
    global _dncnn
    if _dncnn is None and DNCNN_WEIGHTS_PATH.exists():
        device = get_device()
        model = DnCNN(depth=17, n_channels=64, image_channels=1)
        weights = torch.load(str(DNCNN_WEIGHTS_PATH), map_location=device, weights_only=True)
        model.load_state_dict(weights)
        model.to(device)
        model.eval()
        _dncnn = model
    return _dncnn


def is_srgan_available() -> bool:
    return SRGAN_WEIGHTS_PATH.exists()


def is_dncnn_available() -> bool:
    return DNCNN_WEIGHTS_PATH.exists()


# =============================================================================
# Enhancement Routines
# =============================================================================

def enhance_with_srgan(gray_crop: np.ndarray) -> np.ndarray:
    """Super-resolve license plate crop using SRGAN (4x upscale)."""
    model = get_srgan()
    if model is None:
        return gray_crop

    device = get_device()
    # Normalize input to [0, 1] tensor
    h, w = gray_crop.shape[:2]
    # Resize to standard input if very small or large
    target_h = max(24, min(64, (h // 4) * 4 if h >= 32 else 32))
    target_w = max(48, min(128, (w // 4) * 4 if w >= 64 else 64))
    lr_resized = cv2.resize(gray_crop, (target_w, target_h), interpolation=cv2.INTER_AREA)

    tensor_lr = torch.from_numpy(lr_resized).float().unsqueeze(0).unsqueeze(0) / 255.0
    tensor_lr = tensor_lr.to(device)

    with torch.no_grad():
        out = model(tensor_lr)
        # Tanh outputs [-1, 1], map back to [0, 255]
        out = (out.clamp(-1, 1) + 1.0) / 2.0
        out_np = (out.squeeze().cpu().numpy() * 255.0).astype(np.uint8)

    return out_np


def enhance_with_dncnn(gray_crop: np.ndarray) -> np.ndarray:
    """Remove noise from license plate crop using DnCNN."""
    model = get_dncnn()
    if model is None:
        return gray_crop

    device = get_device()
    tensor_in = torch.from_numpy(gray_crop).float().unsqueeze(0).unsqueeze(0) / 255.0
    tensor_in = tensor_in.to(device)

    with torch.no_grad():
        out = model(tensor_in).clamp(0, 1)
        out_np = (out.squeeze().cpu().numpy() * 255.0).astype(np.uint8)

    return out_np


def enhance_plate_crop(crop_bgr: np.ndarray, mode: str = "srgan") -> tuple[np.ndarray, str]:
    """
    Applies neural enhancement (SRGAN or DnCNN) or fallback CLAHE.
    Returns:
        (enhanced_bgr_or_gray, effective_mode_applied)
    """
    if crop_bgr is None or crop_bgr.size == 0:
        return crop_bgr, "none"

    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY) if len(crop_bgr.shape) == 3 else crop_bgr.copy()

    if mode == "srgan" and is_srgan_available():
        sr_img = enhance_with_srgan(gray)
        # Apply gentle CLAHE to super-resolved output for maximum contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        sr_enhanced = clahe.apply(sr_img)
        return sr_enhanced, "SRGAN (4x Super-Resolution)"
    elif mode == "dncnn" and is_dncnn_available():
        denoised = enhance_with_dncnn(gray)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        dn_enhanced = clahe.apply(denoised)
        return dn_enhanced, "DnCNN (Deep Denoising)"
    else:
        # Fallback to classical OpenCV CLAHE + Bilateral filter
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        denoised = cv2.bilateralFilter(enhanced, 7, 50, 50)
        return denoised, "Classical CLAHE + Bilateral"
