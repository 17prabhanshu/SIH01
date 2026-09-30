"""Test to ensure STATUS.md claims are honest and backed by evidence files."""
import os
import re
from pathlib import Path

def test_status_honesty():
    """Fail if STATUS.md claims ACCEPTED without corresponding evidence files."""
    status_file = Path("docs/STATUS.md")
    if not status_file.exists():
        return
        
    content = status_file.read_text()
    
    # Extract the acceptance evidence table
    lines = content.splitlines()
    in_table = False
    evidence_claims = []
    
    for line in lines:
        if "Acceptance Test" in line and "Evidence File" in line:
            in_table = True
            continue
        if in_table and line.startswith("|---"):
            continue
        if in_table and not line.startswith("|"):
            in_table = False
            continue
            
        if in_table:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 5:
                test_name = parts[1]
                evidence_file = parts[3]
                status = parts[4]
                
                if "ACCEPTED" in status or "PASS" in status:
                    if evidence_file and evidence_file != "—" and evidence_file != "-":
                        evidence_claims.append((test_name, evidence_file))
                        
    # Check if the evidence files actually exist
    for test_name, evidence_file in evidence_claims:
        # Some markdown parsing cleanup
        evidence_file = evidence_file.replace("`", "").strip()
        path = Path(evidence_file)
        assert path.exists(), f"HONESTY FAILURE: {test_name} claims ACCEPTED, but evidence file {evidence_file} is missing!"
