"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParameterDecorator = createParameterDecorator;
const errors_1 = require("../errors");
const getMetadataStorage_1 = require("../metadata/getMetadataStorage");
const params_1 = require("../helpers/params");
function createParameterDecorator(resolver, paramOptions = {}) {
    return (prototype, propertyKey, parameterIndex) => {
        if (typeof propertyKey === "symbol") {
            throw new errors_1.SymbolKeysNotSupportedError();
        }
        const options = {};
        if (paramOptions.arg) {
            options.arg = {
                kind: "arg",
                name: paramOptions.arg.name,
                description: paramOptions.arg.options?.description,
                deprecationReason: paramOptions.arg.options?.deprecationReason,
                ...(0, params_1.getParamInfo)({
                    prototype,
                    propertyKey,
                    parameterIndex,
                    returnTypeFunc: paramOptions.arg.typeFunc,
                    options: paramOptions.arg.options,
                    argName: paramOptions.arg.name,
                }),
            };
        }
        (0, getMetadataStorage_1.getMetadataStorage)().collectHandlerParamMetadata({
            kind: "custom",
            target: prototype.constructor,
            methodName: propertyKey,
            index: parameterIndex,
            resolver,
            options,
        });
    };
}
