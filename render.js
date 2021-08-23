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

function clickItemWrapperEvt() {
    let listWrapper = document.querySelector(".list_wrapper");
    console.log(listWrapper);
    listWrapper.addEventListener('click', e => {
        let target = e.target;
        let classList = target.classList;
        let nodeName = target.nodeName;
        if (classList.contains("item-wrapper") && nodeName === "DIV") {
            removeAllFocus()
            target.classList.add('focus');
            enterToCopy();
        } else if (classList.contains("item") && nodeName === "DIV") {
            removeAllFocus()
            target.parentNode.classList.add('focus');
            enterToCopy();
        }


    })
}

function removeAllFocus() {
    let items = document.querySelectorAll(".item-wrapper");
    items.forEach(v => v.classList.remove("focus"));
}


function init() {
    bindClearHistoryEvt(); // 绑定清楚历史记录按钮事件
    pageKeyboard();     // 绑定上下选中按钮
    clickItemWrapperEvt(); //绑定点击事件

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
const ENTER = "Enter"
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
                ifUpDown(false);
                break;
            case ENTER:
                enterToCopy()
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
    });
    if (flag) { // 向上
        currentIndex -= 1;
        if (currentIndex < 0) currentIndex = 0;
    } else { // 向下
        currentIndex += 1;
        if (currentIndex === HISTORY_List_Lenght) currentIndex -= 1;
    }
}


function enterToCopy() {
    let enterDOM = document.querySelectorAll(".item-wrapper.focus");
    if (enterDOM.length == 1) {
        let content = enterDOM[0].querySelector(".item").innerHTML;
        ipcRenderer.send("insert-into-clipboard", content)
        console.log(`成功复制： ${content}`);
    }
    removeAllFocus()
}

init();