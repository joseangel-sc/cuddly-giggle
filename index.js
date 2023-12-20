let scrapDataButton = document.getElementById("scrapData");

const scrapData = async () => {
    const contentXpath = '/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div[2]/div/div[3]/div/div/div/div/div/div[1]/div[2]'
    const subjectXpath = '/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div[1]/div/div[2]/div[1]/h2'
    const senderXpath = '/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div/div[2]/div/div[1]/div/div/div/div[2]/div[2]/div/div[3]/div/div/div/div/div/div[1]/div[2]/div[1]/table/tbody/tr[1]/td[1]/table/tbody/tr/td/h3/span/span[1]/span'

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


    const getContent = (xPath) => {
        const element = document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
        return element.singleNodeValue.innerText
    }
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
                ]
            })
        });
        const data = await response.json();
        const rawJson = data['choices'][0].message.content
        console.log({rawJson})
        return JSON.parse(rawJson)
    }

    const subject = getContent(subjectXpath)
    const sender = getContent(senderXpath)
    console.log({subject, sender})
    const decisionLabToken = 'xxx'
    const prompt = await getDecisionValue('email_prompt', token = decisionLabToken)
    const emailContent = getContent(contentXpath).split('---------- Forwarded message ---------\n')[0]
    const apiKey = await getDecisionValue('openAIAPIKey', token = decisionLabToken)
    console.log({prompt, emailContent, apiKey})
    const gp4Response = await sendPromptToGPT4(prompt + emailContent + "-------END OF EMAIL-------", apiKey)
    // hideSpinner();
    const parsedResults = {
        operacion: subject,
        ejecutiva: sender,
        ...gp4Response
    }

    const dlResponse = await storeInDecisionLab(decisionLabToken, parsedResults, 'append_test')
    console.log({dlResponse})
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
