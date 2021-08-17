const {app,BrowserWindow,Notification,ipcMain} = require("electron");
let win ;

const electronReload = require('electron-reload');

app.on('ready',()=>{
    win = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences:{
            nodeIntegration: true
        }
    })
    win.loadURL('index.html');
    handleIPC();
})

function handleIPC(){

}