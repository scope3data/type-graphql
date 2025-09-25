import { NoExplicitTypeError } from "../errors/index.js";
import { mapMiddlewareMetadataToArray, mapSuperFieldResolverHandlers, mapSuperResolverHandlers, } from "./utils.js";
export class MetadataStorage {
    constructor() {
        this.queries = [];
        this.mutations = [];
        this.subscriptions = [];
        this.fieldResolvers = [];
        this.objectTypes = [];
        this.objectTypesCache = new Map();
        this.inputTypes = [];
        this.argumentTypes = [];
        this.interfaceTypes = [];
        this.interfaceTypesCache = new Map();
        this.authorizedFields = [];
        this.authorizedFieldsByTargetAndFieldCache = new Map();
        this.authorizedResolver = [];
        this.authorizedResolverByTargetCache = new Map();
        this.enums = [];
        this.unions = [];
        this.middlewares = [];
        this.middlewaresByTargetAndFieldCache = new Map();
        this.resolverMiddlewares = [];
        this.resolverMiddlewaresByTargetCache = new Map();
        this.classDirectives = [];
        this.classDirectivesByTargetCache = new Map();
        this.fieldDirectives = [];
        this.fieldDirectivesByTargetAndFieldCache = new Map();
        this.argumentDirectives = [];
        this.classExtensions = [];
        this.fieldExtensions = [];
        this.resolverClasses = [];
        this.resolverClassesCache = new Map();
        this.fields = [];
        this.fieldsCache = new Map();
        this.params = [];
        this.paramsCache = new Map();
    }
    collectQueryHandlerMetadata(definition) {
        this.queries.push(definition);
    }
    collectMutationHandlerMetadata(definition) {
        this.mutations.push(definition);
    }
    collectSubscriptionHandlerMetadata(definition) {
        this.subscriptions.push(definition);
    }
    collectFieldResolverMetadata(definition) {
        this.fieldResolvers.push(definition);
    }
    collectObjectMetadata(definition) {
        this.objectTypes.push(definition);
    }
    collectInputMetadata(definition) {
        this.inputTypes.push(definition);
    }
    collectArgsMetadata(definition) {
        this.argumentTypes.push(definition);
    }
    collectInterfaceMetadata(definition) {
        this.interfaceTypes.push(definition);
    }
    collectAuthorizedFieldMetadata(definition) {
        this.authorizedFields.push(definition);
    }
    collectAuthorizedResolverMetadata(definition) {
        this.authorizedResolver.push(definition);
    }
    collectEnumMetadata(definition) {
        this.enums.push(definition);
    }
    collectUnionMetadata(definition) {
        const unionSymbol = Symbol(definition.name);
        this.unions.push({
            ...definition,
            symbol: unionSymbol,
        });
        return unionSymbol;
    }
    collectMiddlewareMetadata(definition) {
        this.middlewares.push(definition);
    }
    collectResolverMiddlewareMetadata(definition) {
        this.resolverMiddlewares.push(definition);
    }
    collectResolverClassMetadata(definition) {
        this.resolverClasses.push(definition);
    }
    collectClassFieldMetadata(definition) {
        this.fields.push(definition);
    }
    collectHandlerParamMetadata(definition) {
        this.params.push(definition);
    }
    collectDirectiveClassMetadata(definition) {
        this.classDirectives.push(definition);
    }
    collectDirectiveFieldMetadata(definition) {
        this.fieldDirectives.push(definition);
    }
    collectDirectiveArgumentMetadata(definition) {
        this.argumentDirectives.push(definition);
    }
    collectExtensionsClassMetadata(definition) {
        this.classExtensions.push(definition);
    }
    collectExtensionsFieldMetadata(definition) {
        this.fieldExtensions.push(definition);
    }
    initCache() {
        if (this.resolverClasses?.length) {
            this.resolverClasses.forEach(resolverClass => {
                if (!this.resolverClassesCache.has(resolverClass.target)) {
                    this.resolverClassesCache.set(resolverClass.target, resolverClass);
                }
            });
        }
        if (this.params?.length) {
            this.params.forEach(param => {
                const key = `${param.target}-${param.methodName}`;
                if (!this.paramsCache.has(key)) {
                    this.paramsCache.set(key, []);
                }
                this.paramsCache.get(key)?.push(param);
            });
        }
        if (this.middlewares?.length) {
            this.middlewares.forEach(middleware => {
                const key = `${middleware.target}-${middleware.fieldName}`;
                if (!this.middlewaresByTargetAndFieldCache.has(key)) {
                    this.middlewaresByTargetAndFieldCache.set(key, new Set());
                }
                if (!this.middlewaresByTargetAndFieldCache.get(key)?.has(middleware)) {
                    this.middlewaresByTargetAndFieldCache.get(key)?.add(middleware);
                }
            });
        }
        if (this.resolverMiddlewares?.length) {
            this.resolverMiddlewares.forEach(middleware => {
                const key = middleware.target;
                if (!this.resolverMiddlewaresByTargetCache.has(key)) {
                    this.resolverMiddlewaresByTargetCache.set(key, new Set());
                }
                if (!this.resolverMiddlewaresByTargetCache.get(key)?.has(middleware)) {
                    this.resolverMiddlewaresByTargetCache.get(key)?.add(middleware);
                }
            });
        }
        if (this.fieldDirectives?.length) {
            this.fieldDirectives.forEach(directive => {
                const key = `${directive.target}-${directive.fieldName}`;
                if (!this.fieldDirectivesByTargetAndFieldCache.has(key)) {
                    this.fieldDirectivesByTargetAndFieldCache.set(key, []);
                }
                this.fieldDirectivesByTargetAndFieldCache.get(key)?.push(directive);
            });
        }
        if (this.classDirectives?.length) {
            this.classDirectives.forEach(directive => {
                const key = directive.target;
                if (!this.classDirectivesByTargetCache.has(key)) {
                    this.classDirectivesByTargetCache.set(key, []);
                }
                this.classDirectivesByTargetCache.get(key)?.push(directive);
            });
        }
        if (this.authorizedFields?.length) {
            this.authorizedFields.forEach(field => {
                const key = `${field.target}-${field.fieldName}`;
                if (!this.authorizedFieldsByTargetAndFieldCache.has(key)) {
                    this.authorizedFieldsByTargetAndFieldCache.set(key, field);
                }
            });
        }
        if (this.authorizedResolver?.length) {
            this.authorizedResolver.forEach(resolver => {
                const key = resolver.target;
                if (!this.authorizedResolverByTargetCache.has(key)) {
                    this.authorizedResolverByTargetCache.set(key, resolver);
                }
            });
        }
        if (this.fields?.length) {
            this.fields.forEach(field => {
                if (!this.fieldsCache.has(field.target)) {
                    this.fieldsCache.set(field.target, []);
                }
                this.fieldsCache.get(field.target)?.push(field);
            });
        }
        if (this.objectTypes?.length) {
            this.objectTypes.forEach(objType => {
                this.objectTypesCache.set(objType.target, objType);
            });
        }
        if (this.interfaceTypes?.length) {
            this.interfaceTypes.forEach(interfaceType => {
                this.interfaceTypesCache.set(interfaceType.target, interfaceType);
            });
        }
    }
    build(options) {
        this.classDirectives.reverse();
        this.fieldDirectives.reverse();
        this.argumentDirectives.reverse();
        this.classExtensions.reverse();
        this.fieldExtensions.reverse();
        this.initCache();
        this.buildClassMetadata(this.objectTypes);
        this.buildClassMetadata(this.inputTypes);
        this.buildClassMetadata(this.argumentTypes);
        this.buildClassMetadata(this.interfaceTypes);
        this.buildFieldResolverMetadata(this.fieldResolvers, options);
        this.buildResolversMetadata(this.queries);
        this.buildResolversMetadata(this.mutations);
        this.buildResolversMetadata(this.subscriptions);
        this.buildExtendedResolversMetadata();
    }
    clear() {
        this.queries = [];
        this.mutations = [];
        this.subscriptions = [];
        this.fieldResolvers = [];
        this.objectTypes = [];
        this.inputTypes = [];
        this.argumentTypes = [];
        this.interfaceTypes = [];
        this.authorizedFields = [];
        this.authorizedResolver = [];
        this.enums = [];
        this.unions = [];
        this.middlewares = [];
        this.resolverMiddlewares = [];
        this.classDirectives = [];
        this.fieldDirectives = [];
        this.argumentDirectives = [];
        this.classExtensions = [];
        this.fieldExtensions = [];
        this.fieldsCache = new Map();
        this.objectTypesCache = new Map();
        this.interfaceTypesCache = new Map();
        this.middlewaresByTargetAndFieldCache = new Map();
        this.resolverMiddlewaresByTargetCache = new Map();
        this.paramsCache = new Map();
        this.fieldDirectivesByTargetAndFieldCache = new Map();
        this.classDirectivesByTargetCache = new Map();
        this.authorizedFieldsByTargetAndFieldCache = new Map();
        this.authorizedResolverByTargetCache = new Map();
        this.resolverClassesCache = new Map();
        this.resolverClasses = [];
        this.fields = [];
        this.params = [];
    }
    buildClassMetadata(definitions) {
        definitions.forEach(def => {
            if (!def.fields) {
                const fields = this.fieldsCache.get(def.target) || [];
                fields.forEach(field => {
                    field.roles = this.findFieldRoles(field.target, field.name);
                    const paramKey = `${field.target}-${field.name}`;
                    field.params = this.paramsCache.get(paramKey) || [];
                    const resolverMiddlewares = this.resolverMiddlewaresByTargetCache.get(field.target) || [];
                    const middlewaresKey = `${field.target}-${field.name}`;
                    const fieldMiddlewares = this.middlewaresByTargetAndFieldCache.get(middlewaresKey) || [];
                    field.middlewares = [
                        ...mapMiddlewareMetadataToArray(Array.from(resolverMiddlewares)),
                        ...mapMiddlewareMetadataToArray(Array.from(fieldMiddlewares)),
                    ];
                    const directives = this.fieldDirectivesByTargetAndFieldCache.get(`${field.target}-${field.name}`) || [];
                    field.directives = directives.map(it => it.directive);
                    field.extensions = this.findExtensions(field.target, field.name);
                });
                def.fields = fields;
            }
            if (!def.directives) {
                const directives = this.classDirectivesByTargetCache.get(def.target) || [];
                def.directives = directives.map(directive => directive.directive);
            }
            if (!def.extensions) {
                def.extensions = this.findExtensions(def.target);
            }
        });
    }
    buildResolversMetadata(definitions) {
        definitions.forEach(def => {
            def.resolverClassMetadata = this.resolverClassesCache.get(def.target);
            def.params = this.paramsCache.get(`${def.target}-${def.methodName}`) || [];
            def.roles = this.findFieldRoles(def.target, def.methodName);
            const resolverMiddlewares = this.resolverMiddlewaresByTargetCache.get(def.target) || [];
            const fieldMiddlewares = this.middlewaresByTargetAndFieldCache.get(`${def.target}-${def.methodName}`) || [];
            def.middlewares = [
                ...mapMiddlewareMetadataToArray(Array.from(resolverMiddlewares)),
                ...mapMiddlewareMetadataToArray(Array.from(fieldMiddlewares)),
            ];
            def.directives = (this.fieldDirectivesByTargetAndFieldCache.get(`${def.target}-${def.methodName}`) || []).map(it => it.directive);
            def.extensions = this.findExtensions(def.target, def.methodName);
        });
    }
    buildFieldResolverMetadata(definitions, options) {
        this.buildResolversMetadata(definitions);
        definitions.forEach(def => {
            def.roles = this.findFieldRoles(def.target, def.methodName);
            def.directives = (this.fieldDirectivesByTargetAndFieldCache.get(`${def.target}-${def.methodName}`) || []).map(it => it.directive);
            def.extensions = this.findExtensions(def.target, def.methodName);
            def.getObjectType =
                def.kind === "external"
                    ? this.resolverClassesCache.get(def.target).getObjectType
                    : () => def.target;
            if (def.kind === "external") {
                const typeClass = this.resolverClassesCache.get(def.target).getObjectType();
                if (!typeClass) {
                    throw new Error(`Unable to find type class for external resolver ${def.target.name}`);
                }
                const typeMetadata = this.objectTypesCache.get(typeClass) || this.interfaceTypesCache.get(typeClass);
                if (!typeMetadata) {
                    throw new Error(`Unable to find type metadata for input type or object type named '${typeClass.name}'`);
                }
                const typeField = typeMetadata.fields.find(fieldDef => fieldDef.schemaName === def.schemaName);
                if (!typeField) {
                    const shouldCollectFieldMetadata = !options.resolvers ||
                        options.resolvers.some(resolverCls => resolverCls === def.target ||
                            Object.prototype.isPrototypeOf.call(def.target, resolverCls));
                    if (!def.getType || !def.typeOptions) {
                        throw new NoExplicitTypeError(def.target.name, def.methodName);
                    }
                    if (shouldCollectFieldMetadata) {
                        const fieldMetadata = {
                            name: def.methodName,
                            schemaName: def.schemaName,
                            getType: def.getType,
                            target: typeClass,
                            typeOptions: def.typeOptions,
                            deprecationReason: def.deprecationReason,
                            description: def.description,
                            complexity: def.complexity,
                            roles: def.roles,
                            middlewares: def.middlewares,
                            params: def.params,
                            directives: def.directives,
                            extensions: def.extensions,
                        };
                        this.collectClassFieldMetadata(fieldMetadata);
                        typeMetadata.fields.push(fieldMetadata);
                    }
                }
                else {
                    typeField.complexity = def.complexity;
                    if (typeField.params.length === 0) {
                        typeField.params = def.params;
                    }
                    if (def.roles) {
                        typeField.roles = def.roles;
                    }
                    else if (typeField.roles) {
                        def.roles = typeField.roles;
                    }
                }
            }
        });
    }
    buildExtendedResolversMetadata() {
        this.resolverClasses.forEach(def => {
            let superResolver = Object.getPrototypeOf(def.target);
            while (superResolver.prototype) {
                const superResolverMetadata = this.resolverClassesCache.get(superResolver);
                if (superResolverMetadata) {
                    this.queries = mapSuperResolverHandlers(this.queries, superResolver, def);
                    this.mutations = mapSuperResolverHandlers(this.mutations, superResolver, def);
                    this.subscriptions = mapSuperResolverHandlers(this.subscriptions, superResolver, def);
                    this.fieldResolvers = mapSuperFieldResolverHandlers(this.fieldResolvers, superResolver, def);
                }
                superResolver = Object.getPrototypeOf(superResolver);
            }
        });
    }
    findFieldRoles(target, fieldName) {
        const authorizedField = this.authorizedFieldsByTargetAndFieldCache.get(`${target}-${fieldName}`) ||
            this.authorizedResolverByTargetCache.get(target);
        if (!authorizedField) {
            return undefined;
        }
        return authorizedField.roles;
    }
    findExtensions(target, fieldName) {
        const storedExtensions = fieldName
            ? this.fieldExtensions
            : this.classExtensions;
        return storedExtensions
            .filter(entry => (entry.target === target || Object.prototype.isPrototypeOf.call(entry.target, target)) &&
            (!("fieldName" in entry) || entry.fieldName === fieldName))
            .reduce((extensions, entry) => ({ ...extensions, ...entry.extensions }), {});
    }
}
