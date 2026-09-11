import asyncio
import sys
import os

# Add project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.fusion.pipeline import FusionPipeline

async def main():
    print("=" * 60)
    print("NER LANDSLIDE EARLY WARNING - PROTOTYPE CONNECTION")
    print("=" * 60)
    
    # 27.3314, 88.6138 = Gangtok, Sikkim (High risk NER region)
    lat = 27.3314
    lon = 88.6138
    
    print(f"\nTarget Location: Gangtok, Sikkim (Lat: {lat}, Lon: {lon})")
    print("Connecting to live Open-Meteo API for real-time elevation & antecedent rainfall...")
    
    # Initialize pipeline with no DB session for demo purposes
    pipeline = FusionPipeline(db=None)
    
    # Run pipeline end-to-end
    result = await pipeline.run(lat, lon)
    
    print("\nAssessment Status:")
    print(f"    {result.assessment_status}")
    
    print("\nHazard Evidence Score:")
    print(f"    {result.hazard_evidence_score:.3f}")
    
    print("\nCalibrated Probability:")
    print("    UNAVAILABLE")
    
    print("\nActive Evidence:")
    for src, status in result.data_freshness.items():
        if status != "UNAVAILABLE":
            print(f"    {src}: {status}")
            
    print("\nUnavailable Evidence:")
    for m in result.missing_data:
        print(f"    {m}")
        
    print("\nEvidence Coverage:")
    active = pipeline.TOTAL_EVIDENCE_LAYERS - len(result.missing_data)
    print(f"    {active} / {pipeline.TOTAL_EVIDENCE_LAYERS}")
    
    print("\nModel Agreement:")
    if result.model_agreement is not None:
        print(f"    {result.model_agreement * 100:.1f}%")
    else:
        print("    UNAVAILABLE (Insufficient active models)")
        
    print("\nAssessment Confidence:")
    print(f"    {result.assessment_confidence}")
    
    print("\nExplanation:")
    print(f"    {result.explainability_report}")
            
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
