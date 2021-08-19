const { ipcRenderer } = require("electron");

ipcRenderer.send('CONNECT', '')
ipcRenderer.on("msg", (e, v) => { console.log(v); })

ipcRenderer.on("clipboard-history", (e, v) => {
    renderPageList(document.querySelector("#root"), v);
})

ipcRenderer.on("refresh", (e, v) => {
    console.log("refresh ??? ");
    renderPageList(document.querySelector("#root"), v);
})

function renderPageList(root, history) {
    root.innerHTML = `
    ${history.map((item, index) => {
        return `
            <div class="item">${item}</div>
        `
    }).join('')}
    `
}