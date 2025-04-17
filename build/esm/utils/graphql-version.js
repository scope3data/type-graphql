import * as graphql from "graphql";
import semVer from "semver";
import { UnmetGraphQLPeerDependencyError } from "../errors/index.js";
export const graphQLPeerDependencyVersion = "^16.9.0";
export function ensureInstalledCorrectGraphQLPackage() {
    if (!semVer.satisfies(graphql.version, graphQLPeerDependencyVersion)) {
        throw new UnmetGraphQLPeerDependencyError(graphql.version, graphQLPeerDependencyVersion);
    }
}
