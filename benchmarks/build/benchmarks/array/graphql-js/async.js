"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const run_1 = require("../run");
const SampleObjectType = new graphql_1.GraphQLObjectType({
    name: "SampleObject",
    fields: () => ({
        stringField: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            resolve: async (source) => source.stringField,
        },
        numberField: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt),
            resolve: async (source) => source.numberField,
        },
        booleanField: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean),
            resolve: async (source) => source.booleanField,
        },
        nestedField: {
            type: SampleObjectType,
            resolve: async (source) => source.nestedField,
        },
    }),
});
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "Query",
        fields: {
            multipleNestedObjects: {
                type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(SampleObjectType))),
                resolve: () => Array.from({ length: run_1.ARRAY_ITEMS }, (_, index) => ({
                    stringField: "stringField",
                    booleanField: true,
                    numberField: index,
                    nestedField: {
                        stringField: "stringField",
                        booleanField: true,
                        numberField: index,
                    },
                })),
            },
        },
    }),
});
(0, run_1.runBenchmark)(schema).catch(console.error);
