let scrapDataButton = document.getElementById("scrapData");
let goBackButton = document.getElementById("backToHome")
let saveNamesButton = document.getElementById("saveNamesInCurrent")
let goToPageButton = document.getElementById("goToPageButton")
// let targetPage = document.getElementById("goToPageInput")
let targetPage = 4


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


const saveNamesAndRegistry = (pageNumber) => {
    let table = document.getElementsByClassName("text-uppercase")[0].rows
    let tableData = [];
    for (let i = 0; i < table.length; i++) {
        let cells = table[i].cells
        let cellData = {
            name: cells[0].innerText,
            registry: cells[1].innerText,
        }
        tableData.push(cellData)
    }
    console.log(tableData)
    const sendData = async (data) => {
        const url = 'http://localhost:81/'
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)})
        return response.json()
    }
    let dataToSend = {}
    dataToSend[pageNumber] = tableData
    sendData(dataToSend)
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

const goToHomeAction = () => {

    document.addEventListener("DOMContentLoaded", () => {
        goBackButton.addEventListener("click", async () => {
            let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: goToHome,
            });
        });
    });
}

const saveNamesAndRegistryAction = () => {
    document.addEventListener("DOMContentLoaded", () => {
        saveNamesButton.addEventListener("click", async () => {
            let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: saveNamesAndRegistry,
            });
        });
    });
}

const goToPageAction = () => {
    // setTimeout(loadSettings, 10000)
    // document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("load", () => {
            const getCurrentPage = () => {
                let activePageEl = document.getElementsByClassName('page-item active')[0]
                return Number(activePageEl.innerText)
            }


            const goNextPage = () => {
                let curPage = getCurrentPage()
                saveNamesAndRegistry(curPage)
                let navVarEl = document.getElementsByClassName('page-link btnpage g-recaptcha')
                console.log('going to next page')

                let nextPageEl = navVarEl[navVarEl.length - 1]
                nextPageEl.click()


                const recursionNextPage = () => {
                    let curPage = getCurrentPage()
                    console.log('current page: ' + curPage, 'target page: ' + targetPage)
                    if (curPage < targetPage) {
                        console.log('in the recursion!!! going to page ' + (curPage + 1))
                        goNextPage()
                    }
                }
                console.log('calling recursion')
                setTimeout(recursionNextPage, 3000)

                // let [tab] = chrome.tabs.query({active: true, currentWindow: true});
                // chrome.scripting.executeScript({
                //     args: [2],
                //     target: {tabId: tab.id},
                //     function: goToPage,
                // });
            }
            setTimeout(goNextPage, 3000)
            // });
        }
    )
};


scrapDataAction()
goToHomeAction()
saveNamesAndRegistryAction()
goToPageAction()



