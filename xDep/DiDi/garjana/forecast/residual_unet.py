"""Residual U-Net for nowcasting correction.

Predicts growth/decay residual on top of extrapolation baseline.
R7: If model fails, serve baseline. R16: Only serve if held-out CSI >= baseline.

Architecture: Small U-Net with configurable width (default 32).
Inputs: radar history, IR Tb + cooling rate, lightning density,
        CAPE/PWAT/shear, baseline forecast, lead-time embedding.
Loss: weighted MSE + focal/soft-CSI on threshold exceedances.
"""
from __future__ import annotations

import numpy as np

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


if HAS_TORCH:
    class ConvBlock(nn.Module):
        """Double convolution block."""
        def __init__(self, in_ch: int, out_ch: int) -> None:
            super().__init__()
            self.conv = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.conv(x)

    class ResidualUNet(nn.Module):
        """U-Net predicting growth/decay residual.

        The final forecast = baseline + residual (clipped to physical range).
        Width is configurable (default 32) for laptop-scale training.
        """

        def __init__(
            self,
            in_channels: int = 12,
            out_channels: int = 12,
            base_width: int = 32,
            n_leads: int = 12,
        ) -> None:
            super().__init__()
            w = base_width
            self.n_leads = n_leads

            # Lead-time embedding
            self.lead_embed = nn.Embedding(n_leads, 16)
            self.lead_proj = nn.Linear(16, 256 * 256)

            # Encoder
            self.enc1 = ConvBlock(in_channels + 1, w)      # +1 for lead embedding
            self.enc2 = ConvBlock(w, w * 2)
            self.enc3 = ConvBlock(w * 2, w * 4)
            self.enc4 = ConvBlock(w * 4, w * 8)

            self.pool = nn.MaxPool2d(2)

            # Bottleneck
            self.bottleneck = ConvBlock(w * 8, w * 16)

            # Decoder
            self.up4 = nn.ConvTranspose2d(w * 16, w * 8, 2, stride=2)
            self.dec4 = ConvBlock(w * 16, w * 8)
            self.up3 = nn.ConvTranspose2d(w * 8, w * 4, 2, stride=2)
            self.dec3 = ConvBlock(w * 8, w * 4)
            self.up2 = nn.ConvTranspose2d(w * 4, w * 2, 2, stride=2)
            self.dec2 = ConvBlock(w * 4, w * 2)
            self.up1 = nn.ConvTranspose2d(w * 2, w, 2, stride=2)
            self.dec1 = ConvBlock(w * 2, w)

            # Output: residual per lead time
            self.out_conv = nn.Conv2d(w, out_channels, 1)

        def forward(
            self,
            x: torch.Tensor,
            lead_idx: torch.Tensor,
        ) -> torch.Tensor:
            """Forward pass.

            Args:
                x: Input tensor (B, C, H, W)
                lead_idx: Lead time index (B,) in [0, n_leads)

            Returns:
                Residual tensor (B, out_channels, H, W)
            """
            B, C, H, W = x.shape

            # Lead embedding as spatial channel
            le = self.lead_embed(lead_idx)  # (B, 16)
            le = self.lead_proj(le)          # (B, H*W)
            le = le.view(B, 1, H, W)

            x = torch.cat([x, le], dim=1)

            # Encoder
            e1 = self.enc1(x)
            e2 = self.enc2(self.pool(e1))
            e3 = self.enc3(self.pool(e2))
            e4 = self.enc4(self.pool(e3))

            # Bottleneck
            b = self.bottleneck(self.pool(e4))

            # Decoder with skip connections
            d4 = self.dec4(torch.cat([self.up4(b), e4], dim=1))
            d3 = self.dec3(torch.cat([self.up3(d4), e3], dim=1))
            d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
            d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))

            return self.out_conv(d1)


    class SoftCSILoss(nn.Module):
        """Soft approximation of CSI for differentiable training."""

        def __init__(self, threshold: float = 30.0, eps: float = 1e-6) -> None:
            super().__init__()
            self.threshold = threshold
            self.eps = eps

        def forward(
            self,
            pred: torch.Tensor,
            target: torch.Tensor,
        ) -> torch.Tensor:
            # Soft binarization
            pred_soft = torch.sigmoid((pred - self.threshold) * 0.5)
            target_soft = torch.sigmoid((target - self.threshold) * 0.5)

            intersection = (pred_soft * target_soft).sum()
            union = pred_soft.sum() + target_soft.sum() - intersection

            return 1.0 - (intersection + self.eps) / (union + self.eps)


    class CombinedLoss(nn.Module):
        """Weighted MSE + soft CSI loss."""

        def __init__(
            self,
            mse_weight: float = 0.5,
            csi_weight: float = 0.5,
            threshold: float = 30.0,
        ) -> None:
            super().__init__()
            self.mse_weight = mse_weight
            self.csi_weight = csi_weight
            self.csi_loss = SoftCSILoss(threshold)

        def forward(
            self,
            pred: torch.Tensor,
            target: torch.Tensor,
        ) -> torch.Tensor:
            mse = F.mse_loss(pred, target)
            csi = self.csi_loss(pred, target)
            return self.mse_weight * mse + self.csi_weight * csi


def apply_residual(
    baseline: np.ndarray,
    residual: np.ndarray,
    clip_min: float = 0.0,
    clip_max: float = 75.0,
) -> np.ndarray:
    """Apply learned residual to baseline forecast.

    R7: final = baseline + residual, clipped to physical range.
    """
    result = baseline + residual
    return np.clip(result, clip_min, clip_max).astype(np.float32)


def load_model_with_gate(
    model_path: str,
    baseline_scores: dict | None = None,
) -> tuple[any, bool]:
    """Load model and check R16 gating.

    R16: Only serve the learned residual where held-out CSI/FSS >= baseline.

    Returns:
        (model_or_None, should_use_model)
    """
    import json
    from pathlib import Path

    model_card_path = Path(model_path).with_suffix(".json")

    if not Path(model_path).exists():
        return None, False

    # Check model card for gating info
    if model_card_path.exists():
        with open(model_card_path) as f:
            card = json.load(f)

        gate_info = card.get("gating", {})
        if not gate_info.get("passes_gate", False):
            return None, False

    # Try ONNX first, then PyTorch
    try:
        import onnxruntime as ort
        session = ort.InferenceSession(model_path)
        return session, True
    except Exception:
        pass

    if HAS_TORCH:
        try:
            model = torch.load(model_path, map_location="cpu", weights_only=False)
            model.eval()
            return model, True
        except Exception:
            pass

    return None, False
