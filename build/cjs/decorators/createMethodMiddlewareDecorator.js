"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMethodMiddlewareDecorator = createMethodMiddlewareDecorator;
const UseMiddleware_1 = require("./UseMiddleware");
function createMethodMiddlewareDecorator(resolver) {
    return (0, UseMiddleware_1.UseMiddleware)(resolver);
}
