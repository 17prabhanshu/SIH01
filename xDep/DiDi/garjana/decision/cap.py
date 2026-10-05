"""CAP 1.2 XML builder.

Produces CAP 1.2-conformant XML with closed polygon ring in lat,lon order,
severity/urgency/certainty from alert_map.yaml, and multilingual <info> blocks.

R10: We claim CAP 1.2 conformant export, NOT SACHET integration.
"""
from __future__ import annotations

import datetime
from xml.dom.minidom import parseString
from xml.etree.ElementTree import Element, SubElement, tostring

from core.types import Alert

CAP_NS = "urn:oasis:names:tc:emergency:cap:1.2"


def build_cap_xml(alert: Alert) -> str:
    """Build CAP 1.2 XML from an Alert object.

    Returns well-formed XML string with:
    - Closed polygon ring in lat,lon order
    - severity/urgency/certainty from the alert
    - Multilingual <info> blocks (en + hi)
    """
    root = Element("alert")
    root.set("xmlns", CAP_NS)

    SubElement(root, "identifier").text = alert.alert_id
    SubElement(root, "sender").text = "garjana-nowcast"
    SubElement(root, "sent").text = (
        alert.issued or datetime.datetime.now(datetime.timezone.utc)
    ).strftime("%Y-%m-%dT%H:%M:%S+00:00")
    SubElement(root, "status").text = "Actual"
    SubElement(root, "msgType").text = "Alert"
    SubElement(root, "scope").text = "Public"

    # Info blocks for each language
    for lang in alert.languages:
        info = SubElement(root, "info")
        SubElement(info, "language").text = lang
        SubElement(info, "category").text = "Met"
        SubElement(info, "event").text = _event_text(alert.hazard, lang)
        SubElement(info, "urgency").text = alert.urgency.value
        SubElement(info, "severity").text = alert.severity.value
        SubElement(info, "certainty").text = alert.certainty.value

        SubElement(info, "headline").text = _headline(alert, lang)
        SubElement(info, "description").text = _description(alert, lang)
        SubElement(info, "instruction").text = _instruction(alert, lang)

        if alert.expires:
            SubElement(info, "expires").text = alert.expires.strftime(
                "%Y-%m-%dT%H:%M:%S+00:00"
            )

        # Area
        if alert.polygon_wkt:
            area = SubElement(info, "area")
            SubElement(area, "areaDesc").text = "Affected area"
            SubElement(area, "polygon").text = _wkt_to_cap_polygon(alert.polygon_wkt)

    # Pretty print
    xml_str = tostring(root, encoding="unicode")
    return parseString(xml_str).toprettyxml(indent="  ")


def _event_text(hazard: str, lang: str) -> str:
    events = {
        "en": {
            "lightning": "Lightning Risk",
            "heavy_rain": "Heavy Rain",
            "extreme_rain": "Extreme Rain-Rate Risk",
            "hail": "Hail-Favourable Conditions",
            "wind": "Damaging Wind Risk",
        },
        "hi": {
            "lightning": "\u0924\u0921\u093c\u093f\u0924 \u0915\u093e \u0916\u0924\u0930\u093e",
            "heavy_rain": "\u092d\u093e\u0930\u0940 \u0935\u0930\u094d\u0937\u093e",
            "extreme_rain": "\u0905\u0924\u094d\u092f\u0927\u093f\u0915 \u0935\u0930\u094d\u0937\u093e \u0926\u0930 \u0915\u093e \u0916\u0924\u0930\u093e",
            "hail": "\u0913\u0932\u093e\u0935\u0943\u0937\u094d\u091f\u093f \u0905\u0928\u0941\u0915\u0942\u0932 \u0938\u094d\u0925\u093f\u0924\u093f",
            "wind": "\u0939\u093e\u0928\u093f\u0915\u093e\u0930\u0915 \u0939\u0935\u093e \u0915\u093e \u0916\u0924\u0930\u093e",
        },
    }
    return events.get(lang, events["en"]).get(hazard, hazard)


def _headline(alert: Alert, lang: str) -> str:
    if lang == "hi":
        return f"{_event_text(alert.hazard, 'hi')} - {alert.severity.value}"
    return f"{_event_text(alert.hazard, 'en')} - {alert.severity.value}"


def _description(alert: Alert, lang: str) -> str:
    if lang == "hi":
        return f"\u0917\u0930\u094d\u091c\u0928\u093e \u092a\u094d\u0930\u0923\u093e\u0932\u0940 \u0926\u094d\u0935\u093e\u0930\u093e \u091c\u093e\u0930\u0940: {_event_text(alert.hazard, 'hi')}. \u0924\u093f\u0905\u0930: {alert.validation_tier.value}"
    return (
        f"Garjana nowcasting system alert: {_event_text(alert.hazard, 'en')}. "
        f"Validation tier: {alert.validation_tier.value}. "
        f"This is NOT an official IMD warning."
    )


def _instruction(alert: Alert, lang: str) -> str:
    if lang == "hi":
        return "\u0915\u0943\u092a\u092f\u093e \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u092e\u094c\u0938\u092e \u0935\u093f\u092d\u093e\u0917 \u0915\u0947 \u0928\u093f\u0930\u094d\u0926\u0947\u0936\u094b\u0902 \u0915\u093e \u092a\u093e\u0932\u0928 \u0915\u0930\u0947\u0902\u0964"
    return "Follow instructions from the local meteorological department."


def _wkt_to_cap_polygon(wkt: str) -> str:
    """Convert WKT POLYGON to CAP polygon format (lat,lon pairs)."""
    # CAP uses "lat,lon lat,lon ..." (space-separated pairs)
    try:
        coords_str = wkt.replace("POLYGON((", "").replace("))", "")
        pairs = coords_str.split(",")
        cap_pairs = []
        for pair in pairs:
            lon, lat = pair.strip().split()
            cap_pairs.append(f"{lat},{lon}")
        return " ".join(cap_pairs)
    except Exception:
        return ""
