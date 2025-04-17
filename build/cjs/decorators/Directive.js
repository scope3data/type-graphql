"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directive = Directive;
const errors_1 = require("../errors");
const getMetadataStorage_1 = require("../metadata/getMetadataStorage");
function Directive(nameOrDefinition) {
    return (targetOrPrototype, propertyKey, parameterIndexOrDescriptor) => {
        const directive = { nameOrDefinition, args: {} };
        if (typeof propertyKey === "symbol") {
            throw new errors_1.SymbolKeysNotSupportedError();
        }
        if (propertyKey) {
            if (typeof parameterIndexOrDescriptor === "number") {
                (0, getMetadataStorage_1.getMetadataStorage)().collectDirectiveArgumentMetadata({
                    target: targetOrPrototype.constructor,
                    fieldName: propertyKey,
                    parameterIndex: parameterIndexOrDescriptor,
                    directive,
                });
            }
            else {
                (0, getMetadataStorage_1.getMetadataStorage)().collectDirectiveFieldMetadata({
                    target: targetOrPrototype.constructor,
                    fieldName: propertyKey,
                    directive,
                });
            }
        }
        else {
            (0, getMetadataStorage_1.getMetadataStorage)().collectDirectiveClassMetadata({
                target: targetOrPrototype,
                directive,
            });
        }
    };
}
