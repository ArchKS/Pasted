const { globalShortcut } = require("electron");
const Sotre = require('electron-store');
const storeInstance = new Sotre();

exports.storeClipboard = class storeClipboard {
    KEY = "HISTORY";
    constructor() {
    }
    add(newContent) {
        if (storeInstance.has(this.KEY)) {
            let list = storeInstance.get(this.KEY) || [];
            list.unshift(newContent);
            storeInstance.set(this.KEY, list);
        } else {
            storeInstance.set(this.KEY, [newContent]);
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