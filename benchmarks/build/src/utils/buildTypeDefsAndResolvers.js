"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypeDefsAndResolvers = buildTypeDefsAndResolvers;
exports.buildTypeDefsAndResolversSync = buildTypeDefsAndResolversSync;
const graphql_1 = require("graphql");
const buildSchema_1 = require("./buildSchema");
const createResolversMap_1 = require("./createResolversMap");
function createTypeDefsAndResolversMap(schema) {
    const typeDefs = (0, graphql_1.printSchema)(schema);
    const resolvers = (0, createResolversMap_1.createResolversMap)(schema);
    return { typeDefs, resolvers };
}
async function buildTypeDefsAndResolvers(options) {
    const schema = await (0, buildSchema_1.buildSchema)(options);
    return createTypeDefsAndResolversMap(schema);
}
function buildTypeDefsAndResolversSync(options) {
    const schema = (0, buildSchema_1.buildSchemaSync)(options);
    return createTypeDefsAndResolversMap(schema);
}
