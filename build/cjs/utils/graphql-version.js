"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQLPeerDependencyVersion = void 0;
exports.ensureInstalledCorrectGraphQLPackage = ensureInstalledCorrectGraphQLPackage;
const tslib_1 = require("tslib");
const graphql = tslib_1.__importStar(require("graphql"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const errors_1 = require("../errors");
exports.graphQLPeerDependencyVersion = "^16.9.0";
function ensureInstalledCorrectGraphQLPackage() {
    if (!semver_1.default.satisfies(graphql.version, exports.graphQLPeerDependencyVersion)) {
        throw new errors_1.UnmetGraphQLPeerDependencyError(graphql.version, exports.graphQLPeerDependencyVersion);
    }
}
