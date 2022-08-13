let scrapDataButton = document.getElementById("scrapData");
let goBackButton = document.getElementById("backToHome")
let saveNamesButton = document.getElementById("saveNamesInCurrent")

const scrapData = () => {
    let xpathRoutes = {
        name: '/html/body/div[3]/div[2]/div[1]/div/div[1]/div/p[2]',
        municipality: '/html/body/div[3]/div[2]/div[1]/div/div[2]/div/p[2]',
        registry: '/html/body/div[3]/div[2]/div[1]/div/div[3]/div/p[2]',
        services: '/html/body/div[3]/div[2]/div[2]'
    //    TODO: add folio field
    }

    const getContent = (xPath) => {
        let element = document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
        return element.singleNodeValue.innerText
    }

    let name = getContent(xpathRoutes.name)
    let municipality = getContent(xpathRoutes.municipality)
    let registry = getContent(xpathRoutes.registry)
    let services = getContent(xpathRoutes.services)
    // TODO: call airtable API and send data
    console.log({name, municipality, registry, services})
}


const goToHome = () => {
    let backButton = document.getElementsByClassName("btn btn-secondary")[0]
    backButton.click()

}
chrome.storage.sync.get("color", ({ color }) => {
    changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
scrapDataButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapData,
    });
});

goBackButton.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: goToHome,
    });
});
