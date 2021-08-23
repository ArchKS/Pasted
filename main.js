const
    { app,
        BrowserWindow,
        globalShortcut,
        ipcMain,
        clipboard,
        Notification
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
        if(_clipStore.get().indexOf(text) == -1){ // 如果数组中不存在当前复制的内容
            _clipStore.add(text);
            renderWin.reply('refresh',_clipStore.get());
        }
    }
})


app.on('ready', () => {
    win = new BrowserWindow({
        width: 300,
        height: 500,
        x: 12000,
        y: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('index.html');
    // win.webContents.openDevTools();
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
        listener();
    });
}


function listener(){
    // 清除历史命令
    ipcMain.on('clear-clipboard-history',(evt,arg)=>{
        _clipStore.clear();
        renderWin.reply('refresh',_clipStore.get());
    });


    // 将用户复制打入到剪切板
    ipcMain.on("insert-into-clipboard",(evt,arg)=>{
        if(typeof arg === 'string'){
            clipboard.writeText(arg);
        }

        new Notification(
            { 
            title: "复制成功",
            body: arg ,
            silent: true
            }).show()
    })
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