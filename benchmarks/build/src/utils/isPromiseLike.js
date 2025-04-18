"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromiseLike = isPromiseLike;
function isPromiseLike(value) {
    return value != null && typeof value.then === "function";
}
