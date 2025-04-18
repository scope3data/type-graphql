"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataStorage = getMetadataStorage;
const metadata_storage_1 = require("./metadata-storage");
function getMetadataStorage() {
    if (!global.TypeGraphQLMetadataStorage) {
        global.TypeGraphQLMetadataStorage = new metadata_storage_1.MetadataStorage();
    }
    return global.TypeGraphQLMetadataStorage;
}
