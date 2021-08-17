const {ipcRender} = require("electron");
const Timer  = require("time.js");

function startWork(){
    let workTimer = new Timer({
        ontick: ()=>{
            updateTime(); // 进入 更新时间
        },
        onended: ()=>{
            notifiication(); // 结束发送通知
        }
    })
    workTimer.start(10);
}


function updateTime(ms){
    let timerContainer = document.getElementById("timer-container");
    timerContainer.innerHTML = ms;
}

function notifiication(){
    let res = await ipcRender.invoke('work-notification');
    if(res === 'rest'){
        setTimeout(() => {
            alert("休息");
        }, 5* 1000);
    }else if(res =="work"){
        startWork()
    }
}


startWork();