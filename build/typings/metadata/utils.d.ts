import { type Middleware } from "../typings/middleware.js";
import { type BaseResolverMetadata, type FieldResolverMetadata, type ResolverClassMetadata, type ResolverMiddlewareMetadata } from "./definitions/index.js";
export declare function mapSuperResolverHandlers<T extends BaseResolverMetadata>(definitions: T[], superResolver: Function, resolverMetadata: ResolverClassMetadata): T[];
export declare function mapSuperFieldResolverHandlers(definitions: FieldResolverMetadata[], superResolver: Function, resolverMetadata: ResolverClassMetadata): FieldResolverMetadata[];
export declare function mapMiddlewareMetadataToArray(metadata: ResolverMiddlewareMetadata[]): Array<Middleware<any>>;
export declare function ensureReflectMetadataExists(): void;
