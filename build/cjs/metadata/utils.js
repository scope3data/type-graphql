"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSuperResolverHandlers = mapSuperResolverHandlers;
exports.mapSuperFieldResolverHandlers = mapSuperFieldResolverHandlers;
exports.mapMiddlewareMetadataToArray = mapMiddlewareMetadataToArray;
exports.ensureReflectMetadataExists = ensureReflectMetadataExists;
const errors_1 = require("../errors");
const isThrowing_1 = require("../helpers/isThrowing");
function mapSuperResolverHandlers(definitions, superResolver, resolverMetadata) {
    return definitions.map(metadata => metadata.target === superResolver
        ? {
            ...metadata,
            target: resolverMetadata.target,
            resolverClassMetadata: resolverMetadata,
        }
        : metadata);
}
function mapSuperFieldResolverHandlers(definitions, superResolver, resolverMetadata) {
    const superMetadata = mapSuperResolverHandlers(definitions, superResolver, resolverMetadata);
    return superMetadata.map(metadata => metadata.target === superResolver
        ? {
            ...metadata,
            getObjectType: (0, isThrowing_1.isThrowing)(metadata.getObjectType)
                ? resolverMetadata.getObjectType
                : metadata.getObjectType,
        }
        : metadata);
}
function mapMiddlewareMetadataToArray(metadata) {
    return metadata
        .map(m => m.middlewares)
        .reduce((middlewares, resultArray) => resultArray.concat(middlewares), []);
}
function ensureReflectMetadataExists() {
    if (typeof Reflect !== "object" || typeof Reflect.getMetadata !== "function") {
        throw new errors_1.ReflectMetadataMissingError();
    }
}
