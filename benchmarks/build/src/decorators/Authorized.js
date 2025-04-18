"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authorized = Authorized;
const errors_1 = require("../errors");
const decorators_1 = require("../helpers/decorators");
const getMetadataStorage_1 = require("../metadata/getMetadataStorage");
function Authorized(...rolesOrRolesArray) {
    const roles = (0, decorators_1.getArrayFromOverloadedRest)(rolesOrRolesArray);
    return (target, propertyKey, _descriptor) => {
        if (propertyKey == null) {
            (0, getMetadataStorage_1.getMetadataStorage)().collectAuthorizedResolverMetadata({
                target: target,
                roles,
            });
            return;
        }
        if (typeof propertyKey === "symbol") {
            throw new errors_1.SymbolKeysNotSupportedError();
        }
        (0, getMetadataStorage_1.getMetadataStorage)().collectAuthorizedFieldMetadata({
            target: target.constructor,
            fieldName: propertyKey,
            roles,
        });
    };
}
