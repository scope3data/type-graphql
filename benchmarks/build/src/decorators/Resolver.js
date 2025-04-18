"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = Resolver;
const getMetadataStorage_1 = require("../metadata/getMetadataStorage");
function Resolver(objectTypeOrTypeFunc) {
    return target => {
        const getObjectType = objectTypeOrTypeFunc
            ? objectTypeOrTypeFunc.prototype
                ? () => objectTypeOrTypeFunc
                : objectTypeOrTypeFunc
            : () => {
                throw new Error(`No provided object type in '@Resolver' decorator for class '${target.name}!'`);
            };
        (0, getMetadataStorage_1.getMetadataStorage)().collectResolverClassMetadata({
            target,
            getObjectType,
        });
    };
}
