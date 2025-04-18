"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBenchmark = runBenchmark;
const graphql_1 = require("graphql");
const graphql_tag_1 = require("graphql-tag");
const BENCHMARK_ITERATIONS = 100000;
async function runBenchmark(schema) {
    const singleObjectQuery = (0, graphql_tag_1.gql) `
    query {
      singleObject {
        sampleField
      }
    }
  `;
    console.time("singleObject");
    for (let i = 0; i < BENCHMARK_ITERATIONS; i += 1) {
        const result = await (0, graphql_1.execute)({ schema, document: singleObjectQuery });
        console.assert(result.data !== undefined, "result data is undefined");
        console.assert(result.data?.singleObject !== undefined, "data singleObject is undefined");
    }
    console.timeEnd("singleObject");
    const nestedObjectQuery = (0, graphql_tag_1.gql) `
    query {
      nestedObject {
        sampleField
        nestedField {
          sampleField
          nestedField {
            sampleField
            nestedField {
              sampleField
              nestedField {
                sampleField
              }
            }
          }
        }
      }
    }
  `;
    console.time("nestedObject");
    for (let i = 0; i < BENCHMARK_ITERATIONS; i += 1) {
        const result = await (0, graphql_1.execute)({ schema, document: nestedObjectQuery });
        console.assert(result.data !== undefined, "result data is undefined");
        console.assert(result.data.nestedObject.nestedField.nestedField.nestedField.nestedField.sampleField !==
            undefined, "data nestedField are incorrect");
    }
    console.timeEnd("nestedObject");
}
