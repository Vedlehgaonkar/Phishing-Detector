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

            console.error("Backend Error:", error);

            sendResponse({
                result: "Backend Error",
                risk_score: 0,
                threat_level: "LOW"
            });

        });

        return true;
    }
});