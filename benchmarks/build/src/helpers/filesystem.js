"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputFile = outputFile;
exports.outputFileSync = outputFileSync;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const promises_1 = tslib_1.__importDefault(require("node:fs/promises"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
async function outputFile(filePath, fileContent) {
    try {
        await promises_1.default.writeFile(filePath, fileContent);
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
        await promises_1.default.mkdir(node_path_1.default.dirname(filePath), { recursive: true });
        await promises_1.default.writeFile(filePath, fileContent);
    }
}
function outputFileSync(filePath, fileContent) {
    try {
        node_fs_1.default.writeFileSync(filePath, fileContent);
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(filePath), { recursive: true });
        node_fs_1.default.writeFileSync(filePath, fileContent);
    }
}
