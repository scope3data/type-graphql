"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResolverClassMiddlewareDecorator = createResolverClassMiddlewareDecorator;
const UseMiddleware_1 = require("./UseMiddleware");
function createResolverClassMiddlewareDecorator(resolver) {
    return (0, UseMiddleware_1.UseMiddleware)(resolver);
}
