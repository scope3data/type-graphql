import { type ClassTypeResolver, type SubscriptionFilterFunc, type SubscriptionSubscribeFunc, type SubscriptionTopicIdFunc, type SubscriptionTopicsFunc, type TypeOptions, type TypeValueThunk } from "../../decorators/types.js";
import { type Complexity } from "../../typings/index.js";
import { type Middleware } from "../../typings/middleware.js";
import { type DirectiveMetadata } from "./directive-metadata.js";
import { type ExtensionsMetadata } from "./extensions-metadata.js";
import { type ParamMetadata } from "./param-metadata.js";
export interface BaseResolverMetadata {
    methodName: string;
    schemaName: string;
    target: Function;
    complexity: Complexity | undefined;
    resolverClassMetadata?: ResolverClassMetadata;
    params?: ParamMetadata[];
    roles?: any[];
    middlewares?: Array<Middleware<any>>;
    directives?: DirectiveMetadata[];
    extensions?: ExtensionsMetadata;
}
export type ResolverMetadata = {
    getReturnType: TypeValueThunk;
    returnTypeOptions: TypeOptions;
    description?: string;
    deprecationReason?: string;
} & BaseResolverMetadata;
export type FieldResolverMetadata = {
    kind: "internal" | "external";
    description?: string;
    deprecationReason?: string;
    getType?: TypeValueThunk;
    typeOptions?: TypeOptions;
    getObjectType?: ClassTypeResolver;
} & BaseResolverMetadata;
export type SubscriptionResolverMetadata = {
    topics: string | string[] | SubscriptionTopicsFunc | undefined;
    topicId: SubscriptionTopicIdFunc | undefined;
    filter: SubscriptionFilterFunc | undefined;
    subscribe: SubscriptionSubscribeFunc | undefined;
} & ResolverMetadata;
export interface ResolverClassMetadata {
    target: Function;
    getObjectType: ClassTypeResolver;
    superResolver?: ResolverClassMetadata;
}
