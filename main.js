const
    { app,
        BrowserWindow,
        globalShortcut,
        ipcMain,
    } = require("electron");
const clipboardWatcher = require('electron-clipboard-watcher')
const Sotre = require('electron-store');
const storeInstance = new Sotre();
const STOREKEY = "history";

function readClipboardHistoryFromStore() {
    return storeInstance.get(STOREKEY);
}


let win;
let _flag_win = false;
let renderWin;
const watcher = clipboardWatcher({
    // (optional) delay in ms between polls
    watchDelay: 1000,
    // handler for when image data is copied into the clipboard
    onImageChange: function (nativeImage) {
        console.log(nativeImage);
    },
    // handler for when text data is copied into the clipboard
    onTextChange: function (text) {
        console.log(text);
        let list = storeInstance.get(STOREKEY);
        list.unshift(text);
        storeInstance.set({ STOREKEY: list });
        renderWin.reply('refresh',list)
    }
})

// 注册打开面板事件
app.whenReady().then(() => {
    const registryKeyOne = globalShortcut.register("CommandOrControl+Shift+O", () => {
        _flag_win = !_flag_win;
        if (_flag_win) {
            win.show();
        } else {
            win.hide();
        }
    });
    if (!registryKeyOne) console.log("registry key shortcuts error!");
})

app.on('ready', () => {
    win = new BrowserWindow({
        width: 500,
        height: 300,
        x: 300,
        y: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    win.loadFile('index.html');
    // open dev tools
    win.webContents.openDevTools();
    // hide
    // win.hide();
    // 将历史记录发送到面板中
    win.webContents.send('m', 'hello');
    init();

})


app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    watcher.stop();
})

function init() {
    // 渲染进程先和主进程建立联系
    connected(() => {
        // renderWin.reply("msg","hello");
        renderWin.reply("clipboard-history", readClipboardHistoryFromStore());
    });
}

function connected(callback) {
    ipcMain.on("CONNECT", (event, arg) => {
        renderWin = event;
        callback();
    })
}