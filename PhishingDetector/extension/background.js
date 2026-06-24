chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {

        if (request.action === "scan") {

            console.log("Request Received:", request);

            fetch("http://127.0.0.1:5000/check", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: request.url,
                    passwordFields: request.passwordFields,
                    externalForms: request.externalForms,
                    credentialHarvesting: request.credentialHarvesting,
                    fakeLoginPage: request.fakeLoginPage
                })

            })

            .then(response => {

                console.log("HTTP Status:", response.status);

                return response.json();

            })

            .then(data => {

                console.log("Backend Response:", data);

                sendResponse(data);

            })

            .catch(error => {

                
                console.log("Backend Offline");

                sendResponse({
                    result: "Unable to Connect to Backend",
                    risk_score: 0,
                    threat_level: "LOW",
                    password_fields: 0,
                    external_forms: 0,
                    credential_harvesting: false,
                    fake_login_page: false,
                    brand_impersonation: false,
                    suspicious_tld: false
                });

            });

            return true;
        }

    }
);
