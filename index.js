const scrapDataButton = document.getElementById("scrapData");

const scrapData = async () => {
    const storeInDecisionLab = async (token, value, decisionName) => {
        const url = `https://api.justdecision.com/v1/client/decision/${decisionName}/`;
        const payload = {
            value: `\n  ${JSON.stringify(value)}, \n`,
            append: true
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        return await response.json();
    };


    const getDecisionValue = async (decisionName, token) => {
        const url = `https://api.justdecision.com/v1/client/decision/${decisionName}`
        const response = await fetch(url, {
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${token}`
                }
            }
        )
        return await response.text()
    }

    const displayGptResponse = (response) => {
        const messageStart = "Los datos que mandamos a decisionlab ahora son:\n "
        const messageEnd = "\nDando click a ok solo es por ahora una notificación, si hay un error aún debes ir a decisionlab a borrarla manualmente.\n\n"
        const alertString = messageStart + JSON.stringify(response, null, 2) + messageEnd;

        alert(alertString);
    };


    const sendPromptToGPT4 = async (prompt, apiKey) => {
        const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: prompt
                    },
                ],
                // response_format: { "type": "json_object" }
            })
        });
        const data = await response.json();
        const rawJson = data['choices'][0].message.content
        return JSON.parse(rawJson)
    }

    const getSimplifiedHTMLContent = () => {
        // List of selectors to try, in order of likelihood to represent the main content
        const selectors = [
            'div[role="main"]',
            'main',
            'article',
        ];

        let container = null;

        // Try each selector until we find an element
        for (let selector of selectors) {
            container = document.querySelector(selector);
            if (container) break; // Stop if we've found a container
        }

        if (!container) return null; // Return null if no suitable container is found

        // Proceed with cloning and cleaning the container
        const clone = container.cloneNode(true);
        clone.querySelectorAll("script, style, link[rel='stylesheet'], iframe, noscript").forEach(el => el.remove());

        Array.from(clone.childNodes).forEach(node => {
            if (node.nodeType === Node.COMMENT_NODE) {
                node.remove();
            }
        });
        return clone.outerHTML;
    };

    const removeNoiseFromHTML = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Remove script and link elements
        doc.querySelectorAll('script, link').forEach(el => el.remove());

        // Iterate over all elements to clean attributes
        doc.querySelectorAll('*').forEach(el => {
            const attributesToPreserve = ['href', 'src']; // Keep href and src attributes
            Array.from(el.attributes).forEach(attr => {
                if (!attributesToPreserve.includes(attr.name)) {
                    el.removeAttribute(attr.name); // Remove all other attributes
                }
            });
        });

        return doc.body.innerHTML; // Return the cleaned inner HTML of the body
    };
    const decisionLabToken = ''
    const prompt = await getDecisionValue('email_prompt', token = decisionLabToken)
    let emailContent = getSimplifiedHTMLContent()
    emailContent = removeNoiseFromHTML(emailContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = emailContent;
    const plainTextContent = tempDiv.innerText;
    console.log(plainTextContent);
    const apiKey = await getDecisionValue('openAIAPIKey', token = decisionLabToken);

    const gp4Response = await sendPromptToGPT4(prompt + plainTextContent + "-------END OF EMAIL-------", apiKey);
    displayGptResponse(gp4Response);

    const parsedResults = {
        hora: new Date().toISOString(),
        ...gp4Response,
    }

    const dlResponse = await storeInDecisionLab(decisionLabToken, parsedResults, 'append_test')

}


const scrapDataAction = () => {
    document.addEventListener("DOMContentLoaded", () => {
        scrapDataButton.addEventListener("click", async () => {
            let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: scrapData,
            });
        });
    });
}

scrapDataAction();
