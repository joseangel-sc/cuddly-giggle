let scrapDataButton = document.getElementById("scrapData");
let goBackButton = document.getElementById("backToHome")
let saveNamesButton = document.getElementById("saveNamesInCurrent")
let targetPage = 9000
let mode = 'details' // 'details' or 'companyList'


const scrapAndSendDetails = async () => {
    let xpathRoutes = {
        name: '/html/body/div[3]/div[2]/div[1]/div/div[1]/div/p[2]',
        municipality: '/html/body/div[3]/div[2]/div[1]/div/div[2]/div/p[2]',
        registry: '/html/body/div[3]/div[2]/div[1]/div/div[3]/div/p[2]',
        services: '/html/body/div[3]/div[2]/div[2]',
        folio: '/html/body/div[3]/div[1]/div/div/h3'
    }

    const getContent = (xPath) => {
        let element = document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
        return element.singleNodeValue.innerText
    }
    let data = {}
    for (const key in xpathRoutes) {
        data[key] = getContent(xpathRoutes[key])
        console.log(`Scrapping ${key}`)
    }
    const detailsOfRegistry = await getNextRegistry()
    let toSend = {}
    toSend['page'] = detailsOfRegistry['page']
    toSend['row'] = detailsOfRegistry['row']
    toSend['registry'] = detailsOfRegistry['registry']
    toSend['data'] = data

    const url = 'http://localhost:81/post_details'
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(toSend),
        headers: {'Content-Type': 'application/json; charset=utf-8'}
    }
   )
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
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        })
        return response.json()
    }
    let dataToSend = {}
    dataToSend[pageNumber] = tableData
    sendData(dataToSend)
}

const getCurrentPage = () => {
    let activePageEl = document.getElementsByClassName('page-item active')[0]
    return Number(activePageEl.innerText)
}

const getLastScrappedPageNumber = async () => {
    const response = await fetch('http://localhost:81/last_scrapped');
    const data = await response.json();
    return data['length']
}

const getNextRegistry = async () => {
    const response = await fetch('http://localhost:81/next_registry');
    return await response.json();
}

const searchRegistry = async () => {
    let table = document.getElementsByClassName("text-uppercase")[0].rows
    let form = table[0].cells[2].children[0]
    let inputValueEl = form.children[0]

    let targetDetails = await getNextRegistry()
    inputValueEl.defaultValue = targetDetails['registry']
    form.children[form.children.length - 1].click()
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
    window.addEventListener("load", () => {
        if (mode === 'companyList') {
            const goNextPage = async () => {
                let curPage = getCurrentPage()
                saveNamesAndRegistry(curPage)
                let navVarEl = document.getElementsByClassName('page-link btnpage g-recaptcha')
                console.log('going to next page')

                let nextPageEl = navVarEl[navVarEl.length - 1]
                let lastScrapped = await getLastScrappedPageNumber()
                console.log(`Making the 'next' page button take us to the ${lastScrapped} page`)
                nextPageEl.dataset.page = lastScrapped

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

            }
            setTimeout(goNextPage, 3000)
            // });
        }
        else if (mode === 'details') {
            console.log('mode:  details ')
            setTimeout(searchRegistry, 3000)
            setTimeout(scrapAndSendDetails(), 2000)
            setTimeout(goToHome, 1000)
        }
    }
    )
};


scrapDataAction()
goToHomeAction()
saveNamesAndRegistryAction()
goToPageAction()



