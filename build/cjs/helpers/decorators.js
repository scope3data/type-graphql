"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeDecoratorParams = getTypeDecoratorParams;
exports.getNameDecoratorParams = getNameDecoratorParams;
exports.getArrayFromOverloadedRest = getArrayFromOverloadedRest;
function getTypeDecoratorParams(returnTypeFuncOrOptions, maybeOptions) {
    if (typeof returnTypeFuncOrOptions === "function") {
        return {
            returnTypeFunc: returnTypeFuncOrOptions,
            options: maybeOptions || {},
        };
    }
    return {
        options: returnTypeFuncOrOptions || {},
    };
}
function getNameDecoratorParams(nameOrOptions, maybeOptions) {
    if (typeof nameOrOptions === "string") {
        return {
            name: nameOrOptions,
            options: maybeOptions || {},
        };
    }
    return {
        options: nameOrOptions || {},
    };
}
function getArrayFromOverloadedRest(overloadedArray) {
    let items;
    if (Array.isArray(overloadedArray[0])) {
        items = overloadedArray[0];
    }
    else {
        items = overloadedArray;
    }
    return items;
}
