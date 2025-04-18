"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const type_graphql_1 = require("../../src");
const run_1 = require("./run");
let SampleObject = class SampleObject {
};
tslib_1.__decorate([
    (0, type_graphql_1.Field)()
], SampleObject.prototype, "sampleField", void 0);
tslib_1.__decorate([
    (0, type_graphql_1.Field)()
], SampleObject.prototype, "nestedField", void 0);
SampleObject = tslib_1.__decorate([
    (0, type_graphql_1.ObjectType)()
], SampleObject);
let SampleResolver = class SampleResolver {
    singleObject() {
        return { sampleField: "sampleField" };
    }
    nestedObject() {
        return {
            sampleField: "sampleField",
            nestedField: {
                sampleField: "sampleField",
                nestedField: {
                    sampleField: "sampleField",
                    nestedField: {
                        sampleField: "sampleField",
                        nestedField: {
                            sampleField: "sampleField",
                        },
                    },
                },
            },
        };
    }
};
tslib_1.__decorate([
    (0, type_graphql_1.Query)()
], SampleResolver.prototype, "singleObject", null);
tslib_1.__decorate([
    (0, type_graphql_1.Query)()
], SampleResolver.prototype, "nestedObject", null);
SampleResolver = tslib_1.__decorate([
    (0, type_graphql_1.Resolver)()
], SampleResolver);
async function main() {
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [SampleResolver],
    });
    await (0, run_1.runBenchmark)(schema);
}
main().catch(console.error);
