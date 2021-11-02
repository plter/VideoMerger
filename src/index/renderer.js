const Renderer = {

    start() {
        this.findUIComponents();
        this.addListeners();
    },

    findUIComponents() {
        this.btnSelectVideoDir = document.querySelector("#btn-select-video-dir");
        this.videoDirChooser = document.querySelector("#video-dir-chooser");
        this.outputTa = document.querySelector("#output");
    },

    addListeners() {
        this.btnSelectVideoDir.addEventListener("click", this.btnSelectVideoDir_clickedHandler.bind(this));
        this.videoDirChooser.addEventListener("change", this.videoDirChooser_chnageHandler.bind(this));
    },

    btnSelectVideoDir_clickedHandler() {
        this.videoDirChooser.click();
    },

    videoDirChooser_chnageHandler(e) {
        if (e.target.files.length) {
            let dir = node_path.dirname(e.target.files[0].path);
            let files = Array.from(e.target.files)
                .map(item => item.name)
                .filter(item => item.toLowerCase().endsWith(".mp4"))
                .sort()
                .map(item => `file '${node_path.join(dir, item)}'`);

            let filelistFilePath = node_path.join(dir, "filelist.txt");
            node_fs.writeFileSync(filelistFilePath, new node_Buffer(files.join("\n"), "utf8"));
            this.appendMessage(`Created ${filelistFilePath}\n`);

            this.startMergeProcess(filelistFilePath);
        }
    },

    appendMessage(msg) {
        this.outputTa.value += msg + "\n";
        this.outputTa.scrollTop = this.outputTa.scrollHeight;
    },

    async startMergeProcess(filelistFilePath) {
        let appPath = await electron.ipcRenderer.invoke("getAppDir");
        let ffmpeg_path = node_path.join(appPath, "bin", "ffmpeg_mac");
        let desktopDir = node_path.join(node_os.homedir(), "Desktop");
        if (!node_fs.existsSync(desktopDir)) {
            node_fs.mkdirSync(desktopDir);
        }
        let outputFile = node_path.join(desktopDir, `Merge${Date.now()}.mp4`)
        let p = node_child_process.spawn(
            ffmpeg_path,
            [
                "-f", "concat", "-safe", "0", "-i", filelistFilePath,
                "-c:a", "copy", "-c:v", "copy",
                outputFile
            ]
        );
        p.stdout.on("data", this.stdoutHandler.bind(this));
        p.stderr.on("data", this.stderrHandler.bind(this));
        p.on("exit", this.ffmpegProcessExitHandler.bind(this));
    },

    stdoutHandler(d) {
        this.appendMessage(d.toString());
    },

    stderrHandler(d) {
        this.appendMessage(d.toString());
    },

    ffmpegProcessExitHandler(code) {
        this.appendMessage("ffmpeg exit with code " + code);
        if (code) {
            this.appendMessage("合并失败");
        } else {
            this.appendMessage("合并成功");
        }
    }
};

Renderer.start();