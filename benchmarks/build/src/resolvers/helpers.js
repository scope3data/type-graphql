"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParams = getParams;
exports.applyAuthChecker = applyAuthChecker;
exports.applyMiddlewares = applyMiddlewares;
const auth_middleware_1 = require("../helpers/auth-middleware");
const types_1 = require("../helpers/types");
const isPromiseLike_1 = require("../utils/isPromiseLike");
const convert_args_1 = require("./convert-args");
const validate_arg_1 = require("./validate-arg");
function getParams(params, resolverData, globalValidate, globalValidateFn) {
    const paramValues = params
        .sort((a, b) => a.index - b.index)
        .map(paramInfo => {
        switch (paramInfo.kind) {
            case "args":
                return (0, validate_arg_1.validateArg)((0, convert_args_1.convertArgsToInstance)(paramInfo, resolverData.args), paramInfo.getType(), resolverData, globalValidate, paramInfo.validateSettings, globalValidateFn, paramInfo.validateFn);
            case "arg":
                return (0, validate_arg_1.validateArg)((0, convert_args_1.convertArgToInstance)(paramInfo, resolverData.args), paramInfo.getType(), resolverData, globalValidate, paramInfo.validateSettings, globalValidateFn, paramInfo.validateFn);
            case "context":
                if (paramInfo.propertyName) {
                    return resolverData.context[paramInfo.propertyName];
                }
                return resolverData.context;
            case "root": {
                const rootValue = paramInfo.propertyName
                    ? resolverData.root[paramInfo.propertyName]
                    : resolverData.root;
                if (!paramInfo.getType) {
                    return rootValue;
                }
                return (0, types_1.convertToType)(paramInfo.getType(), rootValue);
            }
            case "info":
                return resolverData.info;
            case "custom":
                if (paramInfo.options.arg) {
                    const arg = paramInfo.options.arg;
                    return (0, validate_arg_1.validateArg)((0, convert_args_1.convertArgToInstance)(arg, resolverData.args), arg.getType(), resolverData, globalValidate, arg.validateSettings, globalValidateFn, arg.validateFn).then(() => paramInfo.resolver(resolverData));
                }
                return paramInfo.resolver(resolverData);
        }
    });
    if (paramValues.some(isPromiseLike_1.isPromiseLike)) {
        return Promise.all(paramValues);
    }
    return paramValues;
}
function applyAuthChecker(middlewares, authChecker, container, authMode, roles) {
    if (authChecker && roles) {
        middlewares.unshift((0, auth_middleware_1.AuthMiddleware)(authChecker, container, authMode, roles));
    }
}
function applyMiddlewares(container, resolverData, middlewares, resolverHandlerFunction) {
    if (middlewares.length === 0) {
        return resolverHandlerFunction();
    }
    let middlewaresIndex = -1;
    async function dispatchHandler(currentIndex) {
        if (currentIndex <= middlewaresIndex) {
            throw new Error("next() called multiple times");
        }
        middlewaresIndex = currentIndex;
        let handlerFn;
        if (currentIndex === middlewares.length) {
            handlerFn = resolverHandlerFunction;
        }
        else {
            const currentMiddleware = middlewares[currentIndex];
            if (currentMiddleware.prototype !== undefined) {
                const middlewareClassInstance = await container.getInstance(currentMiddleware, resolverData);
                handlerFn = middlewareClassInstance.use.bind(middlewareClassInstance);
            }
            else {
                handlerFn = currentMiddleware;
            }
        }
        let nextResult;
        const result = await handlerFn(resolverData, async () => {
            nextResult = await dispatchHandler(currentIndex + 1);
            return nextResult;
        });
        return result !== undefined ? result : nextResult;
    }
    return dispatchHandler(0);
}
