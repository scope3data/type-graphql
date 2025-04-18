"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const type_graphql_1 = require("../../../src");
const run_1 = require("../run");
let SampleObject = class SampleObject {
};
tslib_1.__decorate([
    (0, type_graphql_1.Field)()
], SampleObject.prototype, "stringField", void 0);
tslib_1.__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int)
], SampleObject.prototype, "numberField", void 0);
tslib_1.__decorate([
    (0, type_graphql_1.Field)()
], SampleObject.prototype, "booleanField", void 0);
tslib_1.__decorate([
    (0, type_graphql_1.Field)({ nullable: true })
], SampleObject.prototype, "nestedField", void 0);
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
    stringField(source) {
        return source.stringField;
    }
    numberField(source) {
        return source.numberField;
    }
    booleanField(source) {
        return source.booleanField;
    }
    nestedField(source) {
        return source.nestedField;
    }
};
tslib_1.__decorate([
    (0, type_graphql_1.Query)(() => [SampleObject])
], SampleResolver.prototype, "multipleNestedObjects", null);
tslib_1.__decorate([
    (0, type_graphql_1.FieldResolver)(),
    tslib_1.__param(0, (0, type_graphql_1.Root)())
], SampleResolver.prototype, "stringField", null);
tslib_1.__decorate([
    (0, type_graphql_1.FieldResolver)(),
    tslib_1.__param(0, (0, type_graphql_1.Root)())
], SampleResolver.prototype, "numberField", null);
tslib_1.__decorate([
    (0, type_graphql_1.FieldResolver)(),
    tslib_1.__param(0, (0, type_graphql_1.Root)())
], SampleResolver.prototype, "booleanField", null);
tslib_1.__decorate([
    (0, type_graphql_1.FieldResolver)(),
    tslib_1.__param(0, (0, type_graphql_1.Root)())
], SampleResolver.prototype, "nestedField", null);
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
