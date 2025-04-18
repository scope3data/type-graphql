"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const run_1 = require("./run");
const SampleObject = new graphql_1.GraphQLObjectType({
    name: "SampleObject",
    fields: () => ({
        sampleField: {
            type: graphql_1.GraphQLString,
        },
        nestedField: {
            type: SampleObject,
        },
    }),
});
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "Query",
        fields: {
            singleObject: {
                type: SampleObject,
                resolve: () => ({ sampleField: "sampleField" }),
            },
            nestedObject: {
                type: SampleObject,
                resolve: () => ({
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
                }),
            },
        },
    }),
});
(0, run_1.runBenchmark)(schema).catch(console.error);
