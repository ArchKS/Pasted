const
    { app,
        BrowserWindow,
        globalShortcut,
        ipcMain,
    } = require("electron");
const clipboardWatcher = require('electron-clipboard-watcher');


const {storeClipboard,registryShortcuts} = require("./js/util");
const  _clipStore = new storeClipboard();



let win;

let renderWin;

const watcher = clipboardWatcher({
    watchDelay: 1000,
    onImageChange: function (nativeImage) {
        console.log(nativeImage);
    },
    onTextChange: function (text) {
        _clipStore.add(text);
        renderWin.reply('refresh',_clipStore.get());
    }
})


app.on('ready', () => {
    win = new BrowserWindow({
        width: 800,
        height: 700,
        x: 1000,
        y: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('index.html');
    win.webContents.openDevTools();
    init();
    
})


app.on('window-all-closed', () => {
    stop();
})

function init() {
    // 注册键盘事件
    registryShortcuts(win);

    // 渲染进程先和主进程建立联系
    connected(() => {
        // 通过渲染进程窗口实现与渲染进程的通信
        renderWin.reply("clipboard-history", _clipStore.get());

        // 注册清楚历史命令的事件
        clearHistory();
    });
}


function clearHistory(){
    ipcMain.on('clear-clipboard-history',(evt,arg)=>{
        _clipStore.clear();
        renderWin.reply('refresh',_clipStore.get());
    });
}


// 与渲染进程建立联系，并获取渲染进程窗口
function connected(callback) {
    ipcMain.on("CONNECT", (event, arg) => {
        renderWin = event;
        callback();
    })
}


function stop(){
    globalShortcut.unregisterAll();
    watcher.stop();
}