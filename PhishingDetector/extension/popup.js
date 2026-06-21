document.getElementById("checkBtn").addEventListener("click", async () => {

    const result = document.getElementById("result");
    const risk = document.getElementById("risk");
    const threat = document.getElementById("threat");
    const reasonList = document.getElementById("reasonList");

    result.innerText = "Scanning...";

    try {

        let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(
            tab.id,
            {
                action: "getPageData"
            },

            async (pageData) => {

                if (!pageData) {

                    result.innerText = "Cannot read page data";
                    return;

                }

                let response = await fetch(
                    "http://127.0.0.1:5000/check",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(pageData)
                    }
                );

                let data = await response.json();

                result.innerText = data.result;
                risk.innerText = data.risk_score;
                threat.innerText = data.threat_level;

                let reasons = [];

                if (data.brand_impersonation) {
                    reasons.push("Brand Impersonation");
                }

                if (data.credential_harvesting) {
                    reasons.push("Credential Harvesting");
                }

                if (data.fake_login_page) {
                    reasons.push("Fake Login Page");
                }

                if (data.suspicious_tld) {
                    reasons.push("Suspicious TLD");
                }

                if (data.external_forms > 0) {
                    reasons.push("External Form Submission");
                }

                if (reasons.length === 0) {
                    reasons.push("No major threats detected");
                }

                reasonList.innerHTML =
                    reasons.join("<br>");

                if (data.threat_level === "HIGH") {

                    threat.style.color = "#dc2626";

                }
                else if (data.threat_level === "MEDIUM") {

                    threat.style.color = "#f59e0b";

                }
                else {

                    threat.style.color = "#16a34a";

                }

            }
        );

    }
    catch (error) {

        result.innerText =
            "Cannot connect to Flask";

        console.error(error);

    }

});