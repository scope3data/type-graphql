"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARRAY_ITEMS = void 0;
exports.runBenchmark = runBenchmark;
const graphql_1 = require("graphql");
const graphql_tag_1 = require("graphql-tag");
const BENCHMARK_ITERATIONS = 50;
exports.ARRAY_ITEMS = 25000;
async function runBenchmark(schema) {
    const multipleNestedObjectsQuery = (0, graphql_tag_1.gql) `
    query {
      multipleNestedObjects {
        stringField
        booleanField
        numberField
        nestedField {
          stringField
          booleanField
          numberField
        }
      }
    }
  `;
    console.time("multipleNestedObjects");
    for (let i = 0; i < BENCHMARK_ITERATIONS; i += 1) {
        const result = await (0, graphql_1.execute)({ schema, document: multipleNestedObjectsQuery });
        console.assert(result.data !== undefined, "result data is undefined");
        console.assert((result.data?.multipleNestedObjects).length === exports.ARRAY_ITEMS, "result data is not a proper array");
        console.assert((result.data?.multipleNestedObjects)[0].nestedField.booleanField === true, "data nestedField are incorrect");
    }
    console.timeEnd("multipleNestedObjects");
}
