const { app, BrowserWindow, Notification, ipcMain,globalShortcut,dialog } = require("electron");
const path = require("path");
let win;

app.whenReady().then(()=>{
    const retc = globalShortcut.register("CommandOrControl+C",(evt)=>{
        console.log("CommandOrControl+C is pressed",evt);
    })

    const reto = globalShortcut.register("CommandOrControl+Shift+O",()=>{
        console.log("CommandOrControl+Shift+O is pressed");
    })

    console.log(globalShortcut.isRegistered("CommandOrControl+C"));
})

app.on('ready', () => {
    win = new BrowserWindow({
        width: 500,
        height: 400,
        x: 100,
        y: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    
    win.loadFile('index.html');
    win.webContents.openDevTools();
    // handleIPC();
})


app.on('window-all-closed',()=>{
    globalShortcut.unregister("CommandOrControl+X");
    globalShortcut.unregisterAll();
})

function handleIPC() {
    ipcMain.handle("work-notification", async function () {
        let res = await new Promise((resolve, reject) => {
            let notification = new Notification({
                title: "任务结束",
                body: '是否开始休息',
                silent: true,
                actions: [{ text: "开始休息", type: "button" }],
                closeButtonText: '继续工作'
            })

            notification.show();
            notification.on('action', () => {
                resolve('rest');
            });
            notification.on('close', () => {
                resolve('work');
            });
        });

        return res;
    })

}

