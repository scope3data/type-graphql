"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isThrowing = isThrowing;
function isThrowing(fn) {
    try {
        fn();
        return false;
    }
    catch {
        return true;
    }
}
