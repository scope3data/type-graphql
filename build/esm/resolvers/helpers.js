import { AuthMiddleware } from "../helpers/auth-middleware.js";
import { convertToType } from "../helpers/types.js";
import { isPromiseLike } from "../utils/isPromiseLike.js";
import { convertArgToInstance, convertArgsToInstance } from "./convert-args.js";
import { validateArg } from "./validate-arg.js";
export function getParams(params, resolverData, globalValidate, globalValidateFn) {
    const paramValues = params
        .sort((a, b) => a.index - b.index)
        .map(paramInfo => {
        switch (paramInfo.kind) {
            case "args":
                return validateArg(convertArgsToInstance(paramInfo, resolverData.args), paramInfo.getType(), resolverData, globalValidate, paramInfo.validateSettings, globalValidateFn, paramInfo.validateFn);
            case "arg":
                return validateArg(convertArgToInstance(paramInfo, resolverData.args), paramInfo.getType(), resolverData, globalValidate, paramInfo.validateSettings, globalValidateFn, paramInfo.validateFn);
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
                return convertToType(paramInfo.getType(), rootValue);
            }
            case "info":
                return resolverData.info;
            case "custom":
                if (paramInfo.options.arg) {
                    const arg = paramInfo.options.arg;
                    return validateArg(convertArgToInstance(arg, resolverData.args), arg.getType(), resolverData, globalValidate, arg.validateSettings, globalValidateFn, arg.validateFn).then(() => paramInfo.resolver(resolverData));
                }
                return paramInfo.resolver(resolverData);
        }
    });
    if (paramValues.some(isPromiseLike)) {
        return Promise.all(paramValues);
    }
    return paramValues;
}
export function applyAuthChecker(middlewares, authChecker, container, authMode, roles) {
    if (authChecker && roles) {
        middlewares.unshift(AuthMiddleware(authChecker, container, authMode, roles));
    }
}
export function applyMiddlewares(container, resolverData, middlewares, resolverHandlerFunction) {
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
