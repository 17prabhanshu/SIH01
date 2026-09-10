import os
from typing import Optional
from .model_registry import ModelRegistry, ModelInfo

class ModelCardGenerator:
    """Generates standardized Model Cards (Markdown) for ML models."""
    
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        
    def generate_markdown(self, model: ModelInfo) -> str:
        """Generate markdown content for a single model."""
        metrics_str = "\n".join([f"- **{k}**: {v}" for k, v in model.validation_metrics.items()]) if model.validation_metrics else "- None available"
        limitations_str = "\n".join([f"- {lim}" for lim in model.known_limitations]) if model.known_limitations else "- None documented"
        inputs_str = ", ".join(model.input_modalities)
        
        return f"""# Model Card: {model.name}

## 1. Model Details
- **Model ID:** `{model.model_id}`
- **Version:** {model.version}
- **Status:** {model.status.value}
- **License:** {model.license}
- **Last Updated:** {model.last_updated.strftime('%Y-%m-%d')}

## 2. Intended Use
- **Primary Purpose:** {model.description}
- **Output Type:** {model.output_type}
- **Geographic Scope:** {model.geographic_scope}
- **Trigger Type:** {model.trigger_type}

## 3. Data Requirements
- **Input Modalities:** {inputs_str}
- **Training Data:** {model.training_data}
- **Resolution:** {model.resolution}

## 4. Performance & Validation
- **Validation Region:** {model.validation_region}
- **Validation Metrics:**
{metrics_str}

## 5. Limitations & Bias
- **Known Limitations:**
{limitations_str}

## 6. Infrastructure & Compute
- **Compute Requirements:** {model.compute_requirements}
"""

    def export_all(self, output_dir: str) -> None:
        """Generate and save model cards for all models in the registry."""
        os.makedirs(output_dir, exist_ok=True)
        for model in self.registry.list_models():
            md_content = self.generate_markdown(model)
            filename = os.path.join(output_dir, f"{model.model_id}_MODEL_CARD.md")
            with open(filename, "w") as f:
                f.write(md_content)

def generate_cards(output_dir: str):
    """Utility function to generate model cards using the global registry."""
    from .model_registry import registry
    generator = ModelCardGenerator(registry)
    generator.export_all(output_dir)
