"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const type_graphql_1 = require("../../../src");
const run_1 = require("../run");
let SampleObject = class SampleObject {
    get getStringField() {
        return this.stringField;
    }
    get getNumberField() {
        return this.numberField;
    }
    get getBooleanField() {
        return this.booleanField;
    }
    get getNestedField() {
        return this.nestedField;
    }
};
tslib_1.__decorate([
    (0, type_graphql_1.Field)({ name: "stringField" })
], SampleObject.prototype, "getStringField", null);
tslib_1.__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { name: "numberField" })
], SampleObject.prototype, "getNumberField", null);
tslib_1.__decorate([
    (0, type_graphql_1.Field)({ name: "booleanField" })
], SampleObject.prototype, "getBooleanField", null);
tslib_1.__decorate([
    (0, type_graphql_1.Field)(() => SampleObject, { name: "nestedField", nullable: true })
], SampleObject.prototype, "getNestedField", null);
SampleObject = tslib_1.__decorate([
    (0, type_graphql_1.ObjectType)()
], SampleObject);
let SampleResolver = class SampleResolver {
    multipleNestedObjects() {
        return Array.from({ length: run_1.ARRAY_ITEMS }, (_, index) => ({
            stringField: "stringField",
            booleanField: true,
            numberField: index,
            nestedField: {
                stringField: "stringField",
                booleanField: true,
                numberField: index,
            },
        }));
    }
};
tslib_1.__decorate([
    (0, type_graphql_1.Query)(() => [SampleObject])
], SampleResolver.prototype, "multipleNestedObjects", null);
SampleResolver = tslib_1.__decorate([
    (0, type_graphql_1.Resolver)(SampleObject)
], SampleResolver);
async function main() {
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [SampleResolver],
    });
    await (0, run_1.runBenchmark)(schema);
}
main().catch(console.error);
