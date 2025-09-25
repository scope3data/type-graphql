"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgsType = ArgsType;
const getMetadataStorage_1 = require("../metadata/getMetadataStorage");
function ArgsType() {
    return target => {
        (0, getMetadataStorage_1.getMetadataStorage)().collectArgsMetadata({
            name: target.name,
            target,
        });
    };
}
