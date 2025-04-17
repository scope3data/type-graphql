"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamInfo = getParamInfo;
const errors_1 = require("../errors");
const findType_1 = require("./findType");
function getParamInfo({ prototype, propertyKey, parameterIndex, argName, returnTypeFunc, options = {}, }) {
    if (typeof propertyKey === "symbol") {
        throw new errors_1.SymbolKeysNotSupportedError();
    }
    const { getType, typeOptions } = (0, findType_1.findType)({
        metadataKey: "design:paramtypes",
        prototype,
        propertyKey,
        parameterIndex,
        argName,
        returnTypeFunc,
        typeOptions: options,
    });
    return {
        target: prototype.constructor,
        methodName: propertyKey,
        index: parameterIndex,
        getType,
        typeOptions,
        validateSettings: options.validate,
        validateFn: options.validateFn,
    };
}
