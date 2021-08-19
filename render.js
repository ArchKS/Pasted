const {ipcRenderer} = require("electron");
const Timer  = require("timer.js");
const clipboardy = require('clipboardy');


function startWork(){
    let workTimer = new Timer({
        ontick: (ms)=>{
            updateTime(ms); // 进入 更新时间
        },
        onend: ()=>{
            notifiication(); // 结束发送通知
        }
    })
    workTimer.start(3);
}


function updateTime(ms){
    let timerContainer = document.getElementById("timer-container");
    let mm = Math.round(ms / 1000);
    timerContainer.innerHTML = clipboardy.readSync();;
}

async function notifiication(){
    let res = await ipcRenderer.invoke('work-notification');
    console.log(res);
    if(res === 'rest'){
        setTimeout(() => {
            alert("休息");
        }, 5 * 1000);
    }else if(res =="work"){
        startWork()
    }
}


startWork();