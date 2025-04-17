import { type Middleware } from "../../typings/middleware.js";
export interface MiddlewareMetadata {
    target: Function;
    fieldName: string;
    middlewares: Array<Middleware<any>>;
}
export type ResolverMiddlewareMetadata = Omit<MiddlewareMetadata, "fieldName">;
