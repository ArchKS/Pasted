const { ipcRenderer } = require("electron");
const DOM = document.querySelector(".list_wrapper");
ipcRenderer.send('CONNECT', '')
let HISTORY_List_Lenght = 0;


function renderPageList(root, history) {
    // 数组去重
    let set = Array.from(new Set(...[history]));
    HISTORY_List_Lenght = set.length;
    root.innerHTML = `
    ${set.map((item, index) => {
        return `
        <div class="item-wrapper item-${index}">
            <div class="item item-${index}" tabindex=${index}>${item}</div>
        </div>
        `
    }).join('')}
    `
}

function bindClearHistoryEvt() {
    let clearDOM = document.querySelector("#root .clear");
    clearDOM.addEventListener("click", () => {
        console.log("clear history");
        ipcRenderer.send('clear-clipboard-history', '');
    })

}


function init() {
    // 绑定清楚历史记录按钮事件
    bindClearHistoryEvt();
    pageKeyboard();

    // 绑定获取历史剪切板事件
    ipcRenderer.on("clipboard-history", (e, v) => {
        renderPageList(DOM, v);
    })

    // 绑定刷新剪切板事件
    ipcRenderer.on("refresh", (e, v) => {
        renderPageList(DOM, v);
    })
}

const DOWN = "ArrowDown";
const UP = "ArrowUp"
const TAB = "Tab";
let currentIndex = 0;

function pageKeyboard() {
    // 监听 上下按钮 和 Tab按键
    document.body.addEventListener('keydown', e => {
        e.preventDefault();
        let action = e.code;
        switch (action) {
            // 如果是 ⬇
            case DOWN:
                ifUpDown(false);
                break;
            case UP:
                ifUpDown(true);
                break;
            case TAB:
                console.log(TAB);
                break;
            default:
                break;
        }
    });
}

function ifUpDown(flag = true) {
    let ListWrapper = document.querySelectorAll(".item-wrapper");
    ListWrapper.forEach((item, index) => {
        if (item.classList.contains('focus')) {
            item.classList.remove('focus');
        }
        if (index === currentIndex) {
            item.classList.add('focus');
        }
    })
    if (flag) { // 向上
        currentIndex -= 1;
        if (currentIndex < 0) currentIndex = 0;
    } else { // 向下
        currentIndex += 1;
        if (currentIndex = HISTORY_List_Lenght) currentIndex -= 1;
    }
}


init();