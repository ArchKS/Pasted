const { ipcRenderer } = require("electron");
const DOM = document.querySelector(".list_wrapper");
ipcRenderer.send('CONNECT', '')
const KEYBOARD_CODE = {
    DOWN: "ArrowDown",           // 键盘 ⬇ 键 对应的code
    UP: "ArrowUp",                // 键盘 ⬆ 键
    TAB: "Tab",                  // 键盘 Tab键
    ENTER: "Enter",               // 键盘Enter键
    ESC: "Escape",              // 键盘Enter键
    DEL: "Backspace",            // 键盘Delete键
}

let currentIndex = -1;               // 当前选中的数组元素下标
let HISTORY_LIST_LENGTH = 0;        // 数组下标总长度


/* 
 * @desc： 重新渲染历史剪切板列表
 * @params： 
 *  root:HTMLDIVElement：列表节点的根元素
 *  history:string[]: 历史剪切板数组
 * @return：void
 *  DOM
 */
function renderPageList(root, history) {
    // 数组去重
    let set = Array.from(new Set(...[history]));
    HISTORY_LIST_LENGTH = set.length;
    root.innerHTML = `
    ${set.map((item, index) => {
        return `
        <div class="item-wrapper item-${index}">
            <textarea class="item item-${index} ${item.length < 30 ? 'center' : ''}" rows="3"></textarea>
        </div>
        `
    }).join('')}
    `
    for (let index in set) {
        document.querySelector(`.item.item-${index}`).innerHTML = set[index];
    }

    if (currentIndex === -1) {
        currentIndex = 0;
    }
    let dom = document.querySelector(`.item-wrapper.item-${currentIndex}`);
    if(!dom) return;
    dom.classList.add('focus');
}

// 清除历史剪切板
function bindClearHistoryEvt() {
    let clearDOM = document.querySelector("#root .clear");
    if(!clearDOM) return;
    clearDOM.addEventListener("click", () => {
        ipcRenderer.send('clear-clipboard-history', '');
    })

}

// 给列表元素绑定双击复制的事件
function clickItemWrapperEvt() {
    let listWrapper = document.querySelector(".list_wrapper");
    listWrapper.addEventListener('dblclick', e => {
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

// 清除所有的focus样式 ps：给item_wrapper添加focus会有选中效果
function removeAllFocus() {
    let items = document.querySelectorAll(".item-wrapper");
    items.forEach(v => v.classList.remove("focus"));
}


function init() {
    bindClearHistoryEvt(); // 绑定清楚历史记录按钮事件
    pageKeyboard();     // 绑定上下选中按钮
    clickItemWrapperEvt(); //绑定点击事件

    // 主进程会先把历史剪切板数据发送到渲染进程，每一次执行Ctrl+C复制操作的时候，会重新将数据发送到渲染线程，渲染线程收到数据后，对整个列表进行重新的渲染。
    // 绑定获取历史剪切板事件
    ipcRenderer.on("clipboard-history", (e, v) => {
        renderPageList(DOM, v);
    })
    // 绑定刷新剪切板事件
    ipcRenderer.on("refresh", (e, v) => {
        renderPageList(DOM, v);
    })
}



// 监听键盘事件 上下按钮 和 Tab按键
function pageKeyboard() {
    document.body.addEventListener('keydown', e => {
        e.preventDefault();
        let action = e.code;
        switch (action) {
            // 如果是 ⬇
            case KEYBOARD_CODE.DOWN:
                ifUpDown(false);
                break;
            case KEYBOARD_CODE.UP:
                ifUpDown(true);
                break;
            case KEYBOARD_CODE.TAB:
                ifUpDown(false);
                break;
            case KEYBOARD_CODE.ENTER:
                enterToCopy()
                break;
            case KEYBOARD_CODE.ESC:
                ipcRenderer.send('clear-clipboard-history', '');
                break;
            case KEYBOARD_CODE.DEL:
                delSingleHistory();
                break;
            default:
                break;
        }
    });
}

function ifUpDown(flag = true) {
    removeAllFocus();
    if (flag) { // 向上
        if (currentIndex <= 0) {
            currentIndex = HISTORY_LIST_LENGTH - 1;
        } else {
            currentIndex -= 1;
        }
    } else { // 向下
        if (currentIndex >= HISTORY_LIST_LENGTH - 1) {
            currentIndex = 0;
        } else {
            currentIndex += 1;
        }
    }
    currentIndex = Number(currentIndex); // 转义，不这么写会出现 item-01
    document.querySelector(`.item-wrapper.item-${currentIndex}`).classList.add("focus");
    scrollToFocus(); // 判断focus是否滑出屏幕

}

// 敲击回车键进行复制
function enterToCopy() {
    let enterDOM = document.querySelectorAll(".item-wrapper.focus");
    if (enterDOM.length == 1) {
        let content = enterDOM[0].querySelector(".item").innerHTML;
        ipcRenderer.send("insert-into-clipboard", content)
    }
    removeAllFocus();
}

// 删除单个信息
function delSingleHistory() {
    let del = document.querySelector('.focus');
    if (!del) return;
    let item = Array.from(del.classList).filter(v => {
        return /item-(\d+)/.test(v);
    })[0];
    if (!item) return;
    let index = /item-(\d+)/.exec(item)[1];
    ipcRenderer.send("delete-single-item", index);

    if (index == HISTORY_LIST_LENGTH - 1) {
        currentIndex = index - 1
    } else {
        currentIndex = index - 1;
    }
}


// 判断focus元素距离顶部｜底部的距离
function scrollToFocus(){
    let dom = document.querySelector(".focus");
    if(!dom) return;
    let windowHeight = window.innerHeight;
    let rectDis = dom.getBoundingClientRect();
    let top = rectDis.top;

    if(top > windowHeight - rectDis.height){ // 超出屏幕
        document.querySelector("#root").scrollTo(0,top-100);
        console.log("chao chu pingmu");

    }else if(top< 0 ){
        document.querySelector("#root").scrollTo(0,top-100);
    }
}


init();