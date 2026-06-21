console.log("Content Script Loaded");

const passwordFields = document.querySelectorAll(
    'input[type="password"], input[name*="pass"], input[id*="pass"]'
);
const passwordCount = passwordFields.length;

const forms = document.querySelectorAll("form");
let externalForms = 0;
let credentialHarvesting = false;
let fakeLoginPage = false;

const currentHostname = window.location.hostname;

forms.forEach(form => {
    const action = form.action;
    const actionAttr = form.getAttribute("action");
    const hasPassword = form.querySelector('input[type="password"]');

    // 1. Check for Fake Login Page (Password form with no valid action)
    if (
        hasPassword &&
        (actionAttr === null || actionAttr === "" || actionAttr === "#")
    ) {
        fakeLoginPage = true;
    }

    // 2. Check for External Forms (Forms posting outside current domain)
    if (action && action !== "" && !action.includes(currentHostname)) {
        externalForms++;
    }

    // 3. Check for Credential Harvesting (Password form submitting externally)
    if (hasPassword && action && action !== "") {
        try {
            const actionDomain = new URL(action).hostname;
            if (actionDomain && actionDomain !== currentHostname) {
                credentialHarvesting = true;
            }
        } catch (error) {
            console.log("Credential Detection Error:", error);
        }
    }
});

console.log("Password Count:", passwordCount);
console.log("External Forms:", externalForms);
console.log("Credential Harvesting:", credentialHarvesting);
console.log("Fake Login Page:", fakeLoginPage);

// Send data to background/Flask backend via Runtime message
chrome.runtime.sendMessage({
    action: "scan",
    url: window.location.href,
    passwordFields: passwordCount,
    externalForms: externalForms,
    credentialHarvesting: credentialHarvesting,
    fakeLoginPage: fakeLoginPage
}, function(response) {
    console.log("FINAL RESPONSE:", response);

    if (!response) {
        console.log("No response received from background script.");
        return;
    }

    // Remove existing banner if present
    const oldBanner = document.getElementById("phishing-detector-banner");
    if (oldBanner) {
        oldBanner.remove();
    }

    // Determine banner theme based on threat level
    let bannerColor = "#16a34a"; // Default Green (LOW)
    if (response.threat_level === "MEDIUM") {
        bannerColor = "#f59e0b"; // Orange
    } else if (response.threat_level === "HIGH") {
        bannerColor = "#dc2626"; // Red
    }

    // Create the banner UI container
    const banner = document.createElement("div");
    banner.id = "phishing-detector-banner";
    
    // Inline styling to ensure visibility & prevent host page overrides
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.background = bannerColor;
    banner.style.color = "white";
    banner.style.padding = "15px";
    banner.style.zIndex = "2147483647"; // Max z-index
    banner.style.fontFamily = "Arial, sans-serif";
    banner.style.boxSizing = "border-box";
    banner.style.borderBottom = "2px solid black";

    // Safely parse fallback options to prevent "undefined" text on screen
    banner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>🛡️ PHISHING DETECTOR PRO</strong>
        <span id="closeWarning" style="cursor:pointer;font-size:22px;font-weight:bold;">✖</span>
    </div>
    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.3); margin: 10px 0;">
    <p><strong>${response.result || "Scan Complete"}</strong></p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px;">
        <div>Risk Score: ${response.risk_score ?? "N/A"}</div>
        <div>Threat Level: ${response.threat_level || "UNKNOWN"}</div>
        <div>Password Fields: ${response.password_fields ?? passwordCount}</div>
        <div>External Forms: ${response.external_forms ?? externalForms}</div>
        <div>Credential Harvesting: ${response.credential_harvesting ?? credentialHarvesting}</div>
        <div>Fake Login Page: ${response.fake_login_page ?? fakeLoginPage}</div>
        <div>Brand Impersonation: ${response.brand_impersonation ?? "false"}</div>
        <div>Suspicious TLD: ${response.suspicious_tld ?? "false"}</div>
    </div>
    `;

    document.body.appendChild(banner);
    console.log("Banner Added Successfully");

    // Close Button Event Listener
    const closeBtn = document.getElementById("closeWarning");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            banner.remove();
        });
    }
});
chrome.runtime.onMessage.addListener(
(request, sender, sendResponse) => {

    if (request.action === "getPageData") {

        sendResponse({
            url: window.location.href,
            passwordFields: passwordCount,
            externalForms: externalForms,
            credentialHarvesting: credentialHarvesting,
            fakeLoginPage: fakeLoginPage
        });

    }

});