"""
GAN and DnCNN Models for License Plate Image Enhancement.

This module implements:
1. SRGAN (Super-Resolution GAN) — Upscales and enhances low-resolution plate crops
2. DnCNN (Denoising CNN) — Removes noise from CCTV plate images
3. Pix2Pix Generator — Image-to-image translation for plate enhancement

These models complement the existing ANPR pipeline by improving input image quality
before OCR, especially for noisy CCTV footage typical in Indian traffic scenarios.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


# =============================================================================
# 1. DnCNN — Denoising Convolutional Neural Network
# =============================================================================

class DnCNN(nn.Module):
    """
    DnCNN (Denoising CNN) for removing noise from license plate images.
    
    Architecture: Conv -> [Conv+BN+ReLU] x (depth-2) -> Conv
    The network learns a residual mapping (noise), and the clean image
    is obtained by subtracting the predicted noise from the input.
    
    Reference: Zhang et al., "Beyond a Gaussian Denoiser: Residual Learning
    of Deep CNN for Image Denoising" (TIP 2017).
    """

    def __init__(self, depth: int = 17, n_channels: int = 64, 
                 image_channels: int = 1, use_bn: bool = True):
        super().__init__()
        
        layers = []
        # First layer: Conv + ReLU (no batch norm)
        layers.append(nn.Conv2d(image_channels, n_channels, 
                                kernel_size=3, padding=1, bias=True))
        layers.append(nn.ReLU(inplace=True))
        
        # Middle layers: Conv + BN + ReLU
        for _ in range(depth - 2):
            layers.append(nn.Conv2d(n_channels, n_channels, 
                                    kernel_size=3, padding=1, bias=False))
            if use_bn:
                layers.append(nn.BatchNormalization2d(n_channels) 
                              if False else nn.BatchNorm2d(n_channels))
            layers.append(nn.ReLU(inplace=True))
        
        # Last layer: Conv (no BN, no ReLU)
        layers.append(nn.Conv2d(n_channels, image_channels, 
                                kernel_size=3, padding=1, bias=False))
        
        self.dncnn = nn.Sequential(*layers)
        self._initialize_weights()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass: predict noise and subtract from input."""
        noise = self.dncnn(x)
        return x - noise  # Residual learning

    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)


# =============================================================================
# 2. SRGAN — Super-Resolution GAN
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
            nn.Conv2d(in_channels, in_channels * scale_factor ** 2,
                      kernel_size=3, padding=1),
            nn.PixelShuffle(scale_factor),
            nn.PReLU(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)


class SRGANGenerator(nn.Module):
    """
    SRGAN Generator for 4x super-resolution of license plate images.
    
    Architecture: Conv -> ResidualBlocks -> Upsample -> Conv
    Upscales low-resolution plate crops to enable better OCR performance.
    
    Reference: Ledig et al., "Photo-Realistic Single Image Super-Resolution
    Using a Generative Adversarial Network" (CVPR 2017).
    """

    def __init__(self, in_channels: int = 1, num_residual_blocks: int = 16,
                 base_channels: int = 64):
        super().__init__()
        
        # Initial feature extraction
        self.initial = nn.Sequential(
            nn.Conv2d(in_channels, base_channels, kernel_size=9, padding=4),
            nn.PReLU(),
        )
        
        # Residual blocks
        self.residual_blocks = nn.Sequential(
            *[ResidualBlock(base_channels) for _ in range(num_residual_blocks)]
        )
        
        # Post-residual convolution
        self.post_residual = nn.Sequential(
            nn.Conv2d(base_channels, base_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(base_channels),
        )
        
        # Upsampling (2x -> 2x = 4x total)
        self.upsample = nn.Sequential(
            UpsampleBlock(base_channels, scale_factor=2),
            UpsampleBlock(base_channels, scale_factor=2),
        )
        
        # Final output
        self.final = nn.Conv2d(base_channels, in_channels, kernel_size=9, padding=4)
        self.tanh = nn.Tanh()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        initial = self.initial(x)
        residual = self.residual_blocks(initial)
        residual = self.post_residual(residual) + initial
        upsampled = self.upsample(residual)
        return self.tanh(self.final(upsampled))


class SRGANDiscriminator(nn.Module):
    """
    SRGAN Discriminator — classifies images as real (high-res) or fake (generated).
    """

    def __init__(self, in_channels: int = 1, base_channels: int = 64):
        super().__init__()
        
        def discriminator_block(in_ch, out_ch, stride=1, bn=True):
            layers = [nn.Conv2d(in_ch, out_ch, kernel_size=3, stride=stride, padding=1)]
            if bn:
                layers.append(nn.BatchNorm2d(out_ch))
            layers.append(nn.LeakyReLU(0.2, inplace=True))
            return nn.Sequential(*layers)
        
        self.features = nn.Sequential(
            discriminator_block(in_channels, base_channels, stride=1, bn=False),
            discriminator_block(base_channels, base_channels, stride=2),
            discriminator_block(base_channels, base_channels * 2, stride=1),
            discriminator_block(base_channels * 2, base_channels * 2, stride=2),
            discriminator_block(base_channels * 2, base_channels * 4, stride=1),
            discriminator_block(base_channels * 4, base_channels * 4, stride=2),
            discriminator_block(base_channels * 4, base_channels * 8, stride=1),
            discriminator_block(base_channels * 8, base_channels * 8, stride=2),
        )
        
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(base_channels * 8, 1024),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(1024, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.features(x)
        return self.classifier(features)


# =============================================================================
# 3. Pix2Pix Generator (U-Net based) for Image-to-Image Translation
# =============================================================================

class Pix2PixGenerator(nn.Module):
    """
    U-Net based generator for Pix2Pix image-to-image translation.
    Translates noisy/degraded plate images to clean/enhanced versions.
    
    Reference: Isola et al., "Image-to-Image Translation with Conditional
    Adversarial Networks" (CVPR 2017).
    """

    def __init__(self, in_channels: int = 1, out_channels: int = 1, 
                 features: int = 64):
        super().__init__()
        
        # Encoder (downsampling path)
        self.enc1 = self._encoder_block(in_channels, features, bn=False)
        self.enc2 = self._encoder_block(features, features * 2)
        self.enc3 = self._encoder_block(features * 2, features * 4)
        self.enc4 = self._encoder_block(features * 4, features * 8)
        
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(features * 8, features * 8, kernel_size=4, stride=2, padding=1),
            nn.ReLU(inplace=True),
        )
        
        # Decoder (upsampling path with skip connections)
        self.dec4 = self._decoder_block(features * 8, features * 8, dropout=True)
        self.dec3 = self._decoder_block(features * 16, features * 4)
        self.dec2 = self._decoder_block(features * 8, features * 2)
        self.dec1 = self._decoder_block(features * 4, features)
        
        # Final output
        self.final = nn.Sequential(
            nn.ConvTranspose2d(features * 2, out_channels, 
                               kernel_size=4, stride=2, padding=1),
            nn.Tanh(),
        )

    def _encoder_block(self, in_ch, out_ch, bn=True):
        layers = [nn.Conv2d(in_ch, out_ch, kernel_size=4, stride=2, padding=1)]
        if bn:
            layers.append(nn.BatchNorm2d(out_ch))
        layers.append(nn.LeakyReLU(0.2, inplace=True))
        return nn.Sequential(*layers)

    def _decoder_block(self, in_ch, out_ch, dropout=False):
        layers = [
            nn.ConvTranspose2d(in_ch, out_ch, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        ]
        if dropout:
            layers.insert(2, nn.Dropout(0.5))
        return nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Encoder
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        e3 = self.enc3(e2)
        e4 = self.enc4(e3)
        
        # Bottleneck
        b = self.bottleneck(e4)
        
        # Decoder with skip connections
        d4 = self.dec4(b)
        d3 = self.dec3(torch.cat([d4, e4], dim=1))
        d2 = self.dec2(torch.cat([d3, e3], dim=1))
        d1 = self.dec1(torch.cat([d2, e2], dim=1))
        
        return self.final(torch.cat([d1, e1], dim=1))


class PatchDiscriminator(nn.Module):
    """
    PatchGAN Discriminator for Pix2Pix.
    Classifies each NxN patch of an image as real or fake.
    """

    def __init__(self, in_channels: int = 2):  # input + target concatenated
        super().__init__()
        
        self.model = nn.Sequential(
            nn.Conv2d(in_channels, 64, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            
            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            
            nn.Conv2d(256, 512, kernel_size=4, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            
            nn.Conv2d(512, 1, kernel_size=4, stride=1, padding=1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
        return self.model(torch.cat([x, y], dim=1))


# =============================================================================
# 4. Loss Functions
# =============================================================================

class PerceptualLoss(nn.Module):
    """VGG-based perceptual loss for SRGAN training."""
    
    def __init__(self):
        super().__init__()
        # Use first few layers of VGG19 for feature extraction
        from torchvision.models import vgg19, VGG19_Weights
        vgg = vgg19(weights=VGG19_Weights.DEFAULT)
        self.feature_extractor = nn.Sequential(
            *list(vgg.features[:36])
        ).eval()
        for param in self.feature_extractor.parameters():
            param.requires_grad = False

    def forward(self, sr: torch.Tensor, hr: torch.Tensor) -> torch.Tensor:
        # Expand single channel to 3 channels for VGG
        if sr.shape[1] == 1:
            sr = sr.repeat(1, 3, 1, 1)
            hr = hr.repeat(1, 3, 1, 1)
        sr_features = self.feature_extractor(sr)
        hr_features = self.feature_extractor(hr)
        return F.mse_loss(sr_features, hr_features)


# =============================================================================
# 5. Utility Functions
# =============================================================================

def count_parameters(model: nn.Module) -> int:
    """Count total and trainable parameters."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


def model_summary(model: nn.Module, name: str = "Model"):
    """Print a summary of model architecture."""
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\n{'='*60}")
    print(f" {name} Summary")
    print(f"{'='*60}")
    print(f" Total parameters:     {total:,}")
    print(f" Trainable parameters: {trainable:,}")
    print(f" Non-trainable params: {total - trainable:,}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    # Quick architecture verification
    print("Verifying model architectures...\n")
    
    # DnCNN
    dncnn = DnCNN(depth=17, n_channels=64, image_channels=1)
    x = torch.randn(1, 1, 64, 64)
    out = dncnn(x)
    model_summary(dncnn, "DnCNN")
    print(f"  Input:  {x.shape} -> Output: {out.shape}")
    
    # SRGAN Generator
    gen = SRGANGenerator(in_channels=1, num_residual_blocks=16)
    x_lr = torch.randn(1, 1, 32, 32)
    out_sr = gen(x_lr)
    model_summary(gen, "SRGAN Generator")
    print(f"  Input:  {x_lr.shape} -> Output: {out_sr.shape}  (4x upscale)")
    
    # SRGAN Discriminator
    disc = SRGANDiscriminator(in_channels=1)
    out_d = disc(out_sr)
    model_summary(disc, "SRGAN Discriminator")
    print(f"  Input:  {out_sr.shape} -> Output: {out_d.shape}")
    
    # Pix2Pix Generator
    p2p_gen = Pix2PixGenerator(in_channels=1, out_channels=1)
    x_p2p = torch.randn(1, 1, 128, 128)
    out_p2p = p2p_gen(x_p2p)
    model_summary(p2p_gen, "Pix2Pix Generator")
    print(f"  Input:  {x_p2p.shape} -> Output: {out_p2p.shape}")
    
    print("\n[SUCCESS] All model architectures verified successfully!")
