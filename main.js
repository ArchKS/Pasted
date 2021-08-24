const
    { app,
        BrowserWindow,
        globalShortcut,
        ipcMain,
        clipboard,
        Notification
    } = require("electron");
const clipboardWatcher = require('electron-clipboard-watcher');
const { storeClipboard, registryShortcuts } = require("./js/util");
const _clipStore = new storeClipboard();
const path = require("path");
let win;
let renderWin;
const appFolder = path.dirname(process.execPath);
const updateExe = path.resolve(appFolder, "..", "Update.exe");
const exeName = path.basename(process.execPath);

// 开机自启
function launchAtStartup() {
  if (process.platform === "darwin") {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true
    });
  } else {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: updateExe,
      args: [
        "--processStart",
        `"${exeName}"`,
        "--process-start-args",
        `"--hidden"`
      ]
    });
  }
}


const watcher = clipboardWatcher({
    watchDelay: 1000,
    onImageChange: function (nativeImage) {
        console.log(nativeImage);
    },
    onTextChange: function (text) {
        _clipStore.add(text);
        renderWin.reply('refresh', _clipStore.get());
    }
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


function listener() {
    // 清除历史命令
    ipcMain.on('clear-clipboard-history', (evt, arg) => {
        _clipStore.clear();
        renderWin.reply('refresh', _clipStore.get());
    });


    // 将用户复制打入到剪切板
    ipcMain.on("insert-into-clipboard", (evt, arg) => {
        if (typeof arg === 'string') {
            clipboard.writeText(arg);
        }

        new Notification(
            {
                title: "复制成功",
                body: arg,
                silent: true
            }).show()
    });

    // 删除单个历史剪切板
    ipcMain.on('delete-single-item', (evt, arg) => {
        let list = _clipStore.get();
        list.splice(arg, 1);
        _clipStore.reset(list);
        renderWin.reply('refresh', _clipStore.get()); // 刷新剪切板
    })
}


// 与渲染进程建立联系，并获取渲染进程窗口
function connected(callback) {
    ipcMain.on("CONNECT", (event, arg) => {
        renderWin = event;
        callback();
    })
}


function stop() {
    globalShortcut.unregisterAll();
    watcher.stop();
}



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
