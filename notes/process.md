# Electron进程

![image-20210817100801532](img/image-20210817100801532.png)



渲染进程

- 引入模块，各进程直接在electron模块中引入即可

  `const {app,BrowserWindow} = require('election') //主进程引入app`

  `const {ipcRender} = require('electron') // 渲染进程引入ipcRender`

  `ipcRender.invoke(channel,...args).then(res=>{handleResult}) // 渲染进程跟主进程发送请求`



主进程模块

- app，用于控制应用生命周期 `app.on('ready',callback);`

- BrowserWindow，用于创建和控制窗口

  `let win = new BrowserWindow({width, height,....}); // 创建窗口并设置宽高`

  `win.loadURL/loadFile( source ) // 加载页面`

- Notification，创建Notification

  `let notification = new Notification({title,body,actions:[{text,type}]})`

  `notification.show()`

- ipcMain.handle(channel,hander)，处理渲染进程的channel请求，在handler中return返回结果





渲染进程之间的通信

- ipcRender.sendTo  Electron5之后，remote模块特别影响性能

render1.js

```js
const {ipcRender,remote} = require("electron");
let shareObj = remote.getGlobal("sharedObject");
let win2WebContentsId = shareObj.win2WebContentsId;
ipcRender.sendTo(win2WebContentsId,'do-some-work',1);
```

render2.js

```js
const {ipcRender} = require("electron");
ipcRender.on("do-some-work",(evt,arg)=>{
  alert("render2 handle some work",arg);
})
```



main.js

```js
win2 = new BrowserWindow({width: .....});
win2.loadFile("./index2.html")
global.shareObj = {
  win2WebContentsId: win2.WebContents.Id
}
```



- 少用remote模块
- 不要用sync模式
- 在请求+响应的通信模式下，需要自定义超时限制



# ERROR
1. 安装

2. 在render.js中,如果直接使用require会报错，需要在main.js中引入
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }

