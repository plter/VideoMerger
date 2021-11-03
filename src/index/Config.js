const Config = {
    async getAppPath() {
        if (!this.__APP_PATH) {
            this.__APP_PATH = await electron.ipcRenderer.invoke("getAppDir");
        }
        return this.__APP_PATH;
    }
};

export default Config;