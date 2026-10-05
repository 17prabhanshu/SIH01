import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import uuid

def generate_cap_xml(alert_id: str, hazard: str, severity: str, timestamp: str, affected_area_km2: float) -> str:
    """Generate ITU-T X.1303 / OASIS Common Alerting Protocol (CAP) v1.2 XML."""
    cap = ET.Element("alert", xmlns="urn:oasis:names:tc:emergency:cap:1.2")
    
    ET.SubElement(cap, "identifier").text = alert_id
    ET.SubElement(cap, "sender").text = "MoES-Garjana-System"
    ET.SubElement(cap, "sent").text = datetime.now(timezone.utc).astimezone().isoformat()
    ET.SubElement(cap, "status").text = "Actual"
    ET.SubElement(cap, "msgType").text = "Alert"
    ET.SubElement(cap, "scope").text = "Public"
    
    info = ET.SubElement(cap, "info")
    ET.SubElement(info, "category").text = "Met"
    ET.SubElement(info, "event").text = f"Severe {hazard.replace('_', ' ').title()}"
    ET.SubElement(info, "urgency").text = "Immediate"
    
    severity_map = {"SEVERE": "Extreme", "SIGNIFICANT": "Severe", "MODERATE": "Moderate", "WEAK": "Minor"}
    ET.SubElement(info, "severity").text = severity_map.get(severity, "Unknown")
    
    ET.SubElement(info, "certainty").text = "Observed"
    
    # Event Description
    ET.SubElement(info, "headline").text = f"Urgent: {severity} {hazard.replace('_', ' ').title()} detected"
    ET.SubElement(info, "description").text = f"Automated convective nowcasting system has detected {severity} {hazard}. Affected area: {affected_area_km2} sq km."
    ET.SubElement(info, "instruction").text = "Stay indoors. Follow local DDMA authorities."
    
    area = ET.SubElement(info, "area")
    ET.SubElement(area, "areaDesc").text = "Target Zone"
    
    xml_str = ET.tostring(cap, encoding="unicode", method="xml")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml_str
