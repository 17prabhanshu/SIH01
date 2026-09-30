import datetime
import xml.etree.ElementTree as ET
from decision.eta import compute_probabilistic_eta
from decision.exposure import compute_priority_score
from decision.severity import map_severity
from decision.cap import build_cap_xml
from decision.i18n import translate, available_languages
from core.types import HazardValue, ValidationTier, Alert, AlertStatus, AlertSeverity, AlertUrgency, AlertCertainty

def test_eta():
    issued = datetime.datetime.now()
    
    # Synthetic moving cell: 8 members with ETAs
    member_etas = [10, 15, 20, 25, 30, 35, 40, 45]
    eta = compute_probabilistic_eta("s1", "a1", member_etas, issued, n_total=8)
    
    # Check that p50 is roughly the median (27.5 for these, so int might be 27 or 28)
    assert eta.eta_p50_min in [27, 28]
    assert eta.eta_p10_min <= 15
    assert eta.eta_p90_min >= 40
    
    # All are <= 60 min
    assert eta.p_impact_60 == 1.0
    
    # Zero impacting members
    eta_zero = compute_probabilistic_eta("s2", "a1", [], issued, n_total=8)
    assert eta_zero.eta_p50_min is None
    assert eta_zero.eta_p10_min is None
    assert eta_zero.eta_p90_min is None
    assert eta_zero.p_impact_60 in [0.0, None]

def test_exposure():
    hv_valid = HazardValue("lightning", 0.9, "prob", ValidationTier.VALIDATED, "v1", 0.8, 30)
    score_valid = compute_priority_score(hv_valid, asset_criticality=0.9, oi=0.8)
    
    hv_exp = HazardValue("hail", 0.9, "prob", ValidationTier.EXPERIMENTAL, "v1", 0.8, 30)
    score_exp = compute_priority_score(hv_exp, asset_criticality=0.9, oi=0.8)
    
    assert score_valid > score_exp

def test_severity():
    sev_exp, urg_exp, cert_exp = map_severity(ValidationTier.EXPERIMENTAL, 0.9)
    assert sev_exp in (AlertSeverity.MODERATE, AlertSeverity.MINOR, AlertSeverity.UNKNOWN)
    
    sev_val, urg_val, cert_val = map_severity(ValidationTier.VALIDATED, 0.9)
    assert sev_val == AlertSeverity.SEVERE

def test_cap():
    alert = Alert(
        alert_id="test_cap", 
        status=AlertStatus.APPROVED, 
        polygon_wkt="POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))",
        validation_tier=ValidationTier.VALIDATED
    )
    xml_str = build_cap_xml(alert)
    
    # Validate it parses as XML
    root = ET.fromstring(xml_str)
    
    # Contains info blocks
    # By default, CAP ns may be prefixed or not depending on ET parsing, just search text
    assert 'polygon' in xml_str.lower()
    
    # closed ring -> first and last match
    polygon_text = root.find('.//{urn:oasis:names:tc:emergency:cap:1.2}polygon')
    if polygon_text is None:
        # try without namespace
        polygon_text = root.find('.//polygon')
    
    if polygon_text is not None and polygon_text.text:
        coords = polygon_text.text.split()
        assert coords[0] == coords[-1]
    
    # English description should contain 'NOT an official IMD warning'
    assert 'NOT an official IMD warning' in xml_str

def test_i18n():
    en_text = translate('lightning_risk', 'en')
    hi_text = translate('lightning_risk', 'hi')
    
    assert len(en_text) > 0
    assert len(hi_text) > 0
    assert en_text != hi_text
    
    langs = available_languages()
    assert 'en' in langs
    assert 'hi' in langs
