"""ONNX export for CPU-capable inference.

T2 stretch goal. Export the residual U-Net to ONNX for serving.
CPU inference target: < 500 ms per domain per cycle.
"""
from __future__ import annotations


def export_to_onnx(
    model_path: str,
    output_path: str,
    input_shape: tuple = (1, 12, 256, 256),
) -> str:
    """Export PyTorch model to ONNX format."""
    try:
        import torch

        from garjana.forecast.residual_unet import ResidualUNet
    except ImportError:
        raise ImportError("torch required for ONNX export")

    model = torch.load(model_path, map_location="cpu", weights_only=False)
    model.eval()

    dummy_input = torch.randn(*input_shape)
    dummy_lead = torch.zeros(input_shape[0], dtype=torch.long)

    torch.onnx.export(
        model,
        (dummy_input, dummy_lead),
        output_path,
        input_names=["input", "lead_idx"],
        output_names=["residual"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "lead_idx": {0: "batch_size"},
            "residual": {0: "batch_size"},
        },
        opset_version=17,
    )

    return output_path
