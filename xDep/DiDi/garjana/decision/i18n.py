"""Internationalization for alerts.

Supports en (English) + hi (Hindi) + pluggable regional languages.
"""
from __future__ import annotations

TRANSLATIONS = {
    "en": {
        "lightning_risk": "Lightning Risk",
        "heavy_rain": "Heavy Rainfall Warning",
        "extreme_rain_risk": "Extreme Rain-Rate Risk",
        "hail_favourable": "Hail-Favourable Conditions",
        "damaging_wind": "Damaging Wind Risk",
        "take_shelter": "Take shelter immediately.",
        "stay_indoors": "Stay indoors and away from windows.",
        "avoid_travel": "Avoid unnecessary travel.",
        "not_official": "This is NOT an official IMD warning.",
        "tier_validated": "Validated",
        "tier_experimental": "Experimental",
        "tier_environment_only": "Environment-based",
        "tier_proxy": "Proxy-based",
    },
    "hi": {
        "lightning_risk": "\u0924\u0921\u093c\u093f\u0924 \u0915\u093e \u0916\u0924\u0930\u093e",
        "heavy_rain": "\u092d\u093e\u0930\u0940 \u0935\u0930\u094d\u0937\u093e \u091a\u0947\u0924\u093e\u0935\u0928\u0940",
        "extreme_rain_risk": "\u0905\u0924\u094d\u092f\u0927\u093f\u0915 \u0935\u0930\u094d\u0937\u093e \u0926\u0930 \u0915\u093e \u0916\u0924\u0930\u093e",
        "hail_favourable": "\u0913\u0932\u093e\u0935\u0943\u0937\u094d\u091f\u093f \u0905\u0928\u0941\u0915\u0942\u0932 \u0938\u094d\u0925\u093f\u0924\u093f",
        "damaging_wind": "\u0939\u093e\u0928\u093f\u0915\u093e\u0930\u0915 \u0939\u0935\u093e \u0915\u093e \u0916\u0924\u0930\u093e",
        "take_shelter": "\u0924\u0941\u0930\u0902\u0924 \u0906\u0936\u094d\u0930\u092f \u0932\u0947\u0902\u0964",
        "stay_indoors": "\u0918\u0930 \u0915\u0947 \u0905\u0902\u0926\u0930 \u0930\u0939\u0947\u0902\u0964",
        "avoid_travel": "\u0905\u0928\u093e\u0935\u0936\u094d\u092f\u0915 \u092f\u093e\u0924\u094d\u0930\u093e \u0938\u0947 \u092c\u091a\u0947\u0902\u0964",
        "not_official": "\u092f\u0939 \u0906\u0908\u090f\u092e\u0921\u0940 \u0915\u0940 \u0905\u0927\u093f\u0915\u0943\u0924 \u091a\u0947\u0924\u093e\u0935\u0928\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
        "tier_validated": "\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924",
        "tier_experimental": "\u092a\u094d\u0930\u092f\u094b\u0917\u093e\u0924\u094d\u092e\u0915",
        "tier_environment_only": "\u092a\u0930\u094d\u092f\u093e\u0935\u0930\u0923 \u0906\u0927\u093e\u0930\u093f\u0924",
        "tier_proxy": "\u092a\u094d\u0930\u0949\u0915\u094d\u0938\u0940 \u0906\u0927\u093e\u0930\u093f\u0924",
    },
}


def translate(key: str, lang: str = "en") -> str:
    """Get translation for a key."""
    return TRANSLATIONS.get(lang, TRANSLATIONS["en"]).get(
        key, TRANSLATIONS["en"].get(key, key)
    )


def available_languages() -> list[str]:
    return list(TRANSLATIONS.keys())
