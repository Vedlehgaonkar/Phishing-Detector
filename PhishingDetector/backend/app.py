from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from urllib.parse import urlparse
from domain_checker import check_domain

app = Flask(__name__)
CORS(app)

model = joblib.load("model.pkl")

TRUSTED_SITES = [
    "google.com",
    "github.com",
    "facebook.com",
    "amazon.com",
    "microsoft.com",
    "youtube.com",
    "wikipedia.org"
]

SUSPICIOUS_WORDS = [
    "login",
    "verify",
    "bank",
    "secure",
    "account",
    "signin",
    "password",
    "update"
]

SUSPICIOUS_TLDS = [
    ".xyz",
    ".top",
    ".click",
    ".tk",
    ".cf",
    ".gq",
    ".ml",
    ".ga",
    ".work",
    ".support"
]

BRANDS = {
    "google": "google.com",
    "amazon": "amazon.com",
    "paypal": "paypal.com",
    "facebook": "facebook.com",
    "github": "github.com",
    "microsoft": "microsoft.com",
    "youtube": "youtube.com"
}

@app.route("/")
def home():
    return jsonify({
        "status": "working"
    })

@app.route("/check", methods=["POST"])
def check():

    data = request.get_json() or {}

    url = data.get("url", "").lower()

    password_fields = data.get(
        "passwordFields",
        0
    )

    external_forms = data.get(
        "externalForms",
        0
    )

    credential_harvesting = data.get(
        "credentialHarvesting",
        False
    )

    fake_login_page = data.get(
        "fakeLoginPage",
        False
    )

    parsed = urlparse(url)

    domain = parsed.netloc.replace(
        "www.",
        ""
    )

    trusted = any(
        domain == site
        or domain.endswith("." + site)
        for site in TRUSTED_SITES
    )

    suspicious = any(
        word in url
        for word in SUSPICIOUS_WORDS
    )

    suspicious_tld = any(
        domain.endswith(tld)
        for tld in SUSPICIOUS_TLDS
    )

    lookalike = check_domain(domain)

    brand_impersonation = False

    for brand, real_domain in BRANDS.items():

        if brand in domain:

            if not (
                domain == real_domain
                or domain.endswith("." + real_domain)
            ):

                brand_impersonation = True
                break

    length = len(url)

    https = (
        1
        if url.startswith("https")
        else 0
    )

    features = pd.DataFrame([
        {
            "length": length,
            "https": https
        }
    ])

    print("URL Length:", length)
    print("HTTPS:", https)

    prediction = model.predict(features)

    risk_score = 0

    if not trusted:

        if password_fields > 0:
            risk_score += 20

        if external_forms > 0:
            risk_score += 40

        if credential_harvesting:
            risk_score += 70

        if fake_login_page:
            risk_score += 40

        if suspicious:
            risk_score += 30

        if lookalike.get("suspicious"):
            risk_score += 50

        if brand_impersonation:
            risk_score += 50

        if suspicious_tld:
            risk_score += 30

        if (
            prediction[0] == 1
            and
            (
                suspicious
                or credential_harvesting
                or fake_login_page
                or brand_impersonation
                or suspicious_tld
                or lookalike.get("suspicious")
            )
        ):
            risk_score += 20

    if risk_score >= 70:

        threat_level = "HIGH"

    elif risk_score >= 40:

        threat_level = "MEDIUM"

    else:

        threat_level = "LOW"

    threats = []

    if credential_harvesting:

        threats.append(
            "Credential Harvesting"
        )

    if fake_login_page:

        threats.append(
            "Fake Login Page"
        )

    if brand_impersonation:

        threats.append(
            "Brand Impersonation"
        )

    if lookalike.get("suspicious"):

        threats.append(
            f"Look-Alike ({lookalike.get('similar_to')})"
        )

    if suspicious_tld:

        threats.append(
            "Suspicious TLD"
        )

    if suspicious:

        threats.append(
            "Suspicious URL"
        )

    if (
        prediction[0] == 1
        and
        (
            suspicious
            or credential_harvesting
            or fake_login_page
            or brand_impersonation
            or suspicious_tld
            or lookalike.get("suspicious")
        )
    ):

        threats.append(
            "Suspicious Website"
        )

    if trusted:

        result = "Trusted Website"

    elif len(threats) > 0:

        result = " | ".join(
            threats
        )

    else:

        result = "Website Looks Safe"

    print("\n========== DETECTION REPORT ==========")
    print("Domain:", domain)
    print("Trusted:", trusted)
    print("Password Fields:", password_fields)
    print("External Forms:", external_forms)
    print("Credential Harvesting:", credential_harvesting)
    print("Fake Login Page:", fake_login_page)
    print("Look-Alike:", lookalike)
    print("Brand Impersonation:", brand_impersonation)
    print("Suspicious TLD:", suspicious_tld)
    print("ML Prediction:", prediction[0])
    print("Risk Score:", risk_score)
    print("Threat Level:", threat_level)
    print("Result:", result)
    print("======================================\n")

    return jsonify({

        "result": result,

        "risk_score": risk_score,

        "threat_level": threat_level,

        "password_fields": password_fields,

        "external_forms": external_forms,

        "credential_harvesting": credential_harvesting,

        "fake_login_page": fake_login_page,

        "brand_impersonation": brand_impersonation,

        "suspicious_tld": suspicious_tld

    })

if __name__ == "__main__":

    app.run(
        debug=True
    )