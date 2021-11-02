// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

window.electron = require("electron");
window.node_path = require("path");
window.node_fs = require("fs");
window.node_Buffer = Buffer;
window.node_child_process = require("child_process");
window.node_os = require("os");