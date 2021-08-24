const { globalShortcut } = require("electron");
const Sotre = require('electron-store');
const storeInstance = new Sotre();

exports.storeClipboard = class storeClipboard {
    KEY = "HISTORY";
    constructor() {
    }
    add(text) {
        if (storeInstance.has(this.KEY)) {
            let list = storeInstance.get(this.KEY) || [];
            // 去重
            let flag = true;
            let rawList= this.get().map(item=>item.replace(/[ \n]/ig,''));
            if(rawList.indexOf(text.replace(/[ \n]/ig,'')) !== -1){ // 如果数组中不存在当前复制的内容
                flag = false;
            }
            if(String(text).trim() === ""){
                flag= false;
            }
            if(flag){
                list.unshift(text);
                storeInstance.set(this.KEY, list);
            }
        } else {
            storeInstance.set(this.KEY, [text]);
        }
    }


    clear() {
        storeInstance.set(this.KEY, []);
    }

    get() {
        if (storeInstance.has(this.KEY)) {
            return storeInstance.get(this.KEY) || [];
        } else {
            return [];
        }
    }

    reset(list){
        storeInstance.set(this.KEY,list);
    }
}

let _flag_win = false;
exports.registryShortcuts = function registryShortcuts(win) {
    const registryKeyOne = globalShortcut.register("CommandOrControl+Shift+O", () => {
        _flag_win = !_flag_win;
        if (_flag_win) {
            win.show();
        } else {
            win.hide();
        }
    });
    if (!registryKeyOne) console.log("registry key shortcuts error!");
}