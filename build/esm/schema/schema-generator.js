import { Repeater, filter, pipe } from "@graphql-yoga/subscription";
import { GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType, getIntrospectionQuery, graphqlSync, } from "graphql";
import { CannotDetermineGraphQLTypeError, ConflictingDefaultValuesError, GeneratingSchemaError, InterfaceResolveTypeError, MissingPubSubError, MissingSubscriptionTopicsError, UnionResolveTypeError, } from "../errors/index.js";
import { convertTypeIfScalar, getEnumValuesMap, wrapWithTypeOptions } from "../helpers/types.js";
import { getMetadataStorage } from "../metadata/getMetadataStorage.js";
import { MetadataStorage } from "../metadata/metadata-storage.js";
import { createAdvancedFieldResolver, createBasicFieldResolver, createHandlerResolver, wrapResolverWithAuthChecker, } from "../resolvers/create.js";
import { ensureInstalledCorrectGraphQLPackage } from "../utils/graphql-version.js";
import { BuildContext } from "./build-context.js";
import { getFieldDefinitionNode, getInputObjectTypeDefinitionNode, getInputValueDefinitionNode, getInterfaceTypeDefinitionNode, getObjectTypeDefinitionNode, } from "./definition-node.js";
import { getFieldMetadataFromInputType, getFieldMetadataFromObjectType } from "./utils.js";
export class SchemaGenerator {
    static generateFromMetadata(options) {
        console.log("in custom build");
        console.time("generateFromMetadata");
        this.metadataStorage = Object.assign(new MetadataStorage(), getMetadataStorage());
        this.metadataStorage.build(options);
        this.checkForErrors(options);
        BuildContext.create(options);
        console.time("buildTypesInfo");
        this.buildTypesInfo(options.resolvers);
        console.timeEnd("buildTypesInfo");
        const orphanedTypes = options.orphanedTypes ?? [];
        console.time("prebuildSchema");
        const prebuiltSchema = new GraphQLSchema({
            query: this.buildRootQueryType(options.resolvers),
            mutation: this.buildRootMutationType(options.resolvers),
            subscription: this.buildRootSubscriptionType(options.resolvers),
            directives: options.directives,
        });
        console.timeEnd("prebuildSchema");
        const finalSchema = new GraphQLSchema({
            ...prebuiltSchema.toConfig(),
            types: this.buildOtherTypes(orphanedTypes),
        });
        BuildContext.reset();
        this.usedInterfaceTypes = new Set();
        if (!options.skipCheck) {
            const { errors } = graphqlSync({ schema: finalSchema, source: getIntrospectionQuery() });
            if (errors) {
                throw new GeneratingSchemaError(errors);
            }
        }
        console.timeEnd("generateFromMetadata");
        return finalSchema;
    }
    static checkForErrors(options) {
        ensureInstalledCorrectGraphQLPackage();
        if (this.metadataStorage.authorizedFields.length !== 0 && options.authChecker === undefined) {
            throw new Error("You need to provide `authChecker` function for `@Authorized` decorator usage!");
        }
    }
    static getDefaultValue(typeInstance, typeOptions, fieldName, typeName) {
        const { disableInferringDefaultValues } = BuildContext;
        if (disableInferringDefaultValues) {
            return typeOptions.defaultValue;
        }
        const defaultValueFromInitializer = typeInstance[fieldName];
        if (typeOptions.defaultValue !== undefined &&
            defaultValueFromInitializer !== undefined &&
            typeOptions.defaultValue !== defaultValueFromInitializer) {
            throw new ConflictingDefaultValuesError(typeName, fieldName, typeOptions.defaultValue, defaultValueFromInitializer);
        }
        return typeOptions.defaultValue !== undefined
            ? typeOptions.defaultValue
            : defaultValueFromInitializer;
    }
    static buildTypesInfo(resolvers) {
        console.time("unionTypesInfo");
        this.unionTypesInfo = this.metadataStorage.unions.map(unionMetadata => {
            const unionObjectTypesInfo = [];
            const typesThunk = () => {
                unionObjectTypesInfo.push(...unionMetadata
                    .getClassTypes()
                    .map(objectTypeCls => this.objectTypesInfo.find(type => type.target === objectTypeCls)));
                return unionObjectTypesInfo.map(it => it.type);
            };
            return {
                unionSymbol: unionMetadata.symbol,
                type: new GraphQLUnionType({
                    name: unionMetadata.name,
                    description: unionMetadata.description,
                    types: typesThunk,
                    resolveType: unionMetadata.resolveType
                        ? this.getResolveTypeFunction(unionMetadata.resolveType, unionObjectTypesInfo)
                        : instance => {
                            const instanceTarget = unionMetadata
                                .getClassTypes()
                                .find(ObjectClassType => instance instanceof ObjectClassType);
                            if (!instanceTarget) {
                                throw new UnionResolveTypeError(unionMetadata);
                            }
                            const objectTypeInfo = unionObjectTypesInfo.find(type => type.target === instanceTarget);
                            return objectTypeInfo?.type.name;
                        },
                }),
            };
        });
        console.timeEnd("unionTypesInfo");
        console.time("enumTypesInfo");
        this.enumTypesInfo = this.metadataStorage.enums.map(enumMetadata => {
            const enumMap = getEnumValuesMap(enumMetadata.enumObj);
            return {
                enumObj: enumMetadata.enumObj,
                type: new GraphQLEnumType({
                    name: enumMetadata.name,
                    description: enumMetadata.description,
                    values: Object.keys(enumMap).reduce((enumConfig, enumKey) => {
                        const valueConfig = enumMetadata.valuesConfig[enumKey] || {};
                        enumConfig[enumKey] = {
                            value: enumMap[enumKey],
                            description: valueConfig.description,
                            deprecationReason: valueConfig.deprecationReason,
                        };
                        return enumConfig;
                    }, {}),
                }),
            };
        });
        console.timeEnd("enumTypesInfo");
        console.time("objectTypesInfo");
        this.objectTypesInfo = this.metadataStorage.objectTypes.map(objectType => {
            const objectSuperClass = Object.getPrototypeOf(objectType.target);
            const hasExtended = objectSuperClass.prototype !== undefined;
            const getSuperClassType = () => {
                const superClassTypeInfo = this.objectTypesInfo.find(type => type.target === objectSuperClass) ??
                    this.interfaceTypesInfo.find(type => type.target === objectSuperClass);
                return superClassTypeInfo ? superClassTypeInfo.type : undefined;
            };
            const interfaceClasses = objectType.interfaceClasses || [];
            return {
                metadata: objectType,
                target: objectType.target,
                type: new GraphQLObjectType({
                    name: objectType.name,
                    description: objectType.description,
                    astNode: getObjectTypeDefinitionNode(objectType.name, objectType.directives),
                    extensions: objectType.extensions,
                    interfaces: () => {
                        let interfaces = interfaceClasses.map(interfaceClass => {
                            const interfaceTypeInfo = this.interfaceTypesInfo.find(info => info.target === interfaceClass);
                            if (!interfaceTypeInfo) {
                                throw new Error(`Cannot find interface type metadata for class '${interfaceClass.name}' ` +
                                    `provided in 'implements' option for '${objectType.target.name}' object type class. ` +
                                    `Please make sure that class is annotated with an '@InterfaceType()' decorator.`);
                            }
                            return interfaceTypeInfo.type;
                        });
                        if (hasExtended) {
                            const superClass = getSuperClassType();
                            if (superClass) {
                                const superInterfaces = superClass.getInterfaces();
                                interfaces = Array.from(new Set(interfaces.concat(superInterfaces)));
                            }
                        }
                        return interfaces;
                    },
                    fields: () => {
                        const fieldsMetadata = [];
                        if (objectType.interfaceClasses) {
                            const implementedInterfaces = this.metadataStorage.interfaceTypes.filter(it => objectType.interfaceClasses.includes(it.target));
                            implementedInterfaces.forEach(it => {
                                fieldsMetadata.push(...(it.fields || []));
                            });
                        }
                        fieldsMetadata.push(...objectType.fields);
                        let fields = fieldsMetadata.reduce((fieldsMap, field) => {
                            const { fieldResolvers } = this.metadataStorage;
                            const filteredFieldResolversMetadata = fieldResolvers.filter(it => it.kind === "internal" || resolvers.includes(it.target));
                            const fieldResolverMetadata = filteredFieldResolversMetadata.find(it => it.getObjectType() === field.target && it.methodName === field.name);
                            const type = this.getGraphQLOutputType(field.target, field.name, field.getType(), field.typeOptions);
                            const isSimpleResolver = field.simple !== undefined
                                ? field.simple === true
                                : objectType.simpleResolvers !== undefined
                                    ? objectType.simpleResolvers === true
                                    : false;
                            fieldsMap[field.schemaName] = {
                                type,
                                args: this.generateHandlerArgs(field.target, field.name, field.params),
                                resolve: fieldResolverMetadata
                                    ? createAdvancedFieldResolver(fieldResolverMetadata)
                                    : isSimpleResolver
                                        ? undefined
                                        : createBasicFieldResolver(field),
                                description: field.description,
                                deprecationReason: field.deprecationReason,
                                astNode: getFieldDefinitionNode(field.name, type, field.directives),
                                extensions: {
                                    complexity: field.complexity,
                                    ...field.extensions,
                                    ...fieldResolverMetadata?.extensions,
                                },
                            };
                            return fieldsMap;
                        }, {});
                        if (hasExtended) {
                            const superClass = getSuperClassType();
                            if (superClass) {
                                const superClassFields = getFieldMetadataFromObjectType(superClass);
                                fields = { ...superClassFields, ...fields };
                            }
                        }
                        return fields;
                    },
                }),
            };
        });
        console.timeEnd("objectTypesInfo");
        console.time("interfaceTypesInfo");
        this.interfaceTypesInfo = this.metadataStorage.interfaceTypes.map(interfaceType => {
            const interfaceSuperClass = Object.getPrototypeOf(interfaceType.target);
            const hasExtended = interfaceSuperClass.prototype !== undefined;
            const getSuperClassType = () => {
                const superClassTypeInfo = this.interfaceTypesInfo.find(type => type.target === interfaceSuperClass);
                return superClassTypeInfo ? superClassTypeInfo.type : undefined;
            };
            const implementingObjectTypesTargets = this.metadataStorage.objectTypes
                .filter(objectType => objectType.interfaceClasses &&
                objectType.interfaceClasses.includes(interfaceType.target))
                .map(objectType => objectType.target);
            const implementingObjectTypesInfo = this.objectTypesInfo.filter(objectTypesInfo => implementingObjectTypesTargets.includes(objectTypesInfo.target));
            return {
                metadata: interfaceType,
                target: interfaceType.target,
                type: new GraphQLInterfaceType({
                    name: interfaceType.name,
                    description: interfaceType.description,
                    astNode: getInterfaceTypeDefinitionNode(interfaceType.name, interfaceType.directives),
                    interfaces: () => {
                        let interfaces = (interfaceType.interfaceClasses || []).map(interfaceClass => this.interfaceTypesInfo.find(info => info.target === interfaceClass).type);
                        if (hasExtended) {
                            const superClass = getSuperClassType();
                            if (superClass) {
                                const superInterfaces = superClass.getInterfaces();
                                interfaces = Array.from(new Set(interfaces.concat(superInterfaces)));
                            }
                        }
                        return interfaces;
                    },
                    fields: () => {
                        const fieldsMetadata = [];
                        if (interfaceType.interfaceClasses) {
                            const implementedInterfacesMetadata = this.metadataStorage.interfaceTypes.filter(it => interfaceType.interfaceClasses.includes(it.target));
                            implementedInterfacesMetadata.forEach(it => {
                                fieldsMetadata.push(...(it.fields || []));
                            });
                        }
                        fieldsMetadata.push(...interfaceType.fields);
                        let fields = fieldsMetadata.reduce((fieldsMap, field) => {
                            const fieldResolverMetadata = this.metadataStorage.fieldResolvers.find(resolver => resolver.getObjectType() === field.target &&
                                resolver.methodName === field.name);
                            const type = this.getGraphQLOutputType(field.target, field.name, field.getType(), field.typeOptions);
                            fieldsMap[field.schemaName] = {
                                type,
                                args: this.generateHandlerArgs(field.target, field.name, field.params),
                                resolve: fieldResolverMetadata
                                    ? createAdvancedFieldResolver(fieldResolverMetadata)
                                    : createBasicFieldResolver(field),
                                description: field.description,
                                deprecationReason: field.deprecationReason,
                                astNode: getFieldDefinitionNode(field.name, type, field.directives),
                                extensions: {
                                    complexity: field.complexity,
                                    ...field.extensions,
                                },
                            };
                            return fieldsMap;
                        }, {});
                        if (hasExtended) {
                            const superClass = getSuperClassType();
                            if (superClass) {
                                const superClassFields = getFieldMetadataFromObjectType(superClass);
                                fields = { ...superClassFields, ...fields };
                            }
                        }
                        return fields;
                    },
                    resolveType: interfaceType.resolveType
                        ? this.getResolveTypeFunction(interfaceType.resolveType, implementingObjectTypesInfo)
                        : instance => {
                            const typeTarget = implementingObjectTypesTargets.find(typeCls => instance instanceof typeCls);
                            if (!typeTarget) {
                                throw new InterfaceResolveTypeError(interfaceType);
                            }
                            const objectTypeInfo = implementingObjectTypesInfo.find(type => type.target === typeTarget);
                            return objectTypeInfo?.type.name;
                        },
                }),
            };
        });
        console.timeEnd("interfaceTypesInfo");
        console.time("inputTypesInfo");
        this.inputTypesInfo = this.metadataStorage.inputTypes.map(inputType => {
            const objectSuperClass = Object.getPrototypeOf(inputType.target);
            const getSuperClassType = () => {
                const superClassTypeInfo = this.inputTypesInfo.find(type => type.target === objectSuperClass);
                return superClassTypeInfo ? superClassTypeInfo.type : undefined;
            };
            const inputInstance = new inputType.target();
            return {
                target: inputType.target,
                type: new GraphQLInputObjectType({
                    name: inputType.name,
                    description: inputType.description,
                    extensions: inputType.extensions,
                    fields: () => {
                        let fields = inputType.fields.reduce((fieldsMap, field) => {
                            const defaultValue = this.getDefaultValue(inputInstance, field.typeOptions, field.name, inputType.name);
                            const type = this.getGraphQLInputType(field.target, field.name, field.getType(), {
                                ...field.typeOptions,
                                defaultValue,
                            });
                            fieldsMap[field.name] = {
                                description: field.description,
                                type,
                                defaultValue,
                                astNode: getInputValueDefinitionNode(field.name, type, field.directives),
                                extensions: field.extensions,
                                deprecationReason: field.deprecationReason,
                            };
                            return fieldsMap;
                        }, {});
                        if (objectSuperClass.prototype !== undefined) {
                            const superClass = getSuperClassType();
                            if (superClass) {
                                const superClassFields = getFieldMetadataFromInputType(superClass);
                                fields = { ...superClassFields, ...fields };
                            }
                        }
                        return fields;
                    },
                    astNode: getInputObjectTypeDefinitionNode(inputType.name, inputType.directives),
                }),
            };
        });
        console.timeEnd("inputTypesInfo");
    }
    static buildRootQueryType(resolvers) {
        const queriesHandlers = this.filterHandlersByResolvers(this.metadataStorage.queries, resolvers);
        return new GraphQLObjectType({
            name: "Query",
            fields: this.generateHandlerFields(queriesHandlers),
        });
    }
    static buildRootMutationType(resolvers) {
        const mutationsHandlers = this.filterHandlersByResolvers(this.metadataStorage.mutations, resolvers);
        if (mutationsHandlers.length === 0) {
            return undefined;
        }
        return new GraphQLObjectType({
            name: "Mutation",
            fields: this.generateHandlerFields(mutationsHandlers),
        });
    }
    static buildRootSubscriptionType(resolvers) {
        const subscriptionsHandlers = this.filterHandlersByResolvers(this.metadataStorage.subscriptions, resolvers);
        if (subscriptionsHandlers.length === 0) {
            return undefined;
        }
        return new GraphQLObjectType({
            name: "Subscription",
            fields: this.generateSubscriptionsFields(subscriptionsHandlers),
        });
    }
    static buildOtherTypes(orphanedTypes) {
        const autoRegisteredObjectTypesInfo = this.objectTypesInfo.filter(typeInfo => typeInfo.metadata.interfaceClasses?.some(interfaceClass => {
            const implementedInterfaceInfo = this.interfaceTypesInfo.find(it => it.target === interfaceClass);
            if (!implementedInterfaceInfo) {
                return false;
            }
            if (implementedInterfaceInfo.metadata.autoRegisteringDisabled) {
                return false;
            }
            if (!this.usedInterfaceTypes.has(interfaceClass)) {
                return false;
            }
            return true;
        }));
        return [
            ...this.filterTypesInfoByOrphanedTypesAndExtractType(this.objectTypesInfo, orphanedTypes),
            ...this.filterTypesInfoByOrphanedTypesAndExtractType(this.interfaceTypesInfo, orphanedTypes),
            ...this.filterTypesInfoByOrphanedTypesAndExtractType(this.inputTypesInfo, orphanedTypes),
            ...autoRegisteredObjectTypesInfo.map(typeInfo => typeInfo.type),
        ];
    }
    static generateHandlerFields(handlers) {
        return handlers.reduce((fields, handler) => {
            const type = this.getGraphQLOutputType(handler.target, handler.methodName, handler.getReturnType(), handler.returnTypeOptions);
            fields[handler.schemaName] = {
                type,
                args: this.generateHandlerArgs(handler.target, handler.methodName, handler.params),
                resolve: createHandlerResolver(handler),
                description: handler.description,
                deprecationReason: handler.deprecationReason,
                astNode: getFieldDefinitionNode(handler.schemaName, type, handler.directives),
                extensions: {
                    complexity: handler.complexity,
                    ...handler.extensions,
                },
            };
            return fields;
        }, {});
    }
    static generateSubscriptionsFields(subscriptionsHandlers) {
        if (!subscriptionsHandlers.length) {
            return {};
        }
        const { pubSub, container } = BuildContext;
        if (!pubSub) {
            throw new MissingPubSubError();
        }
        const basicFields = this.generateHandlerFields(subscriptionsHandlers);
        return subscriptionsHandlers.reduce((fields, handler) => {
            let subscribeFn;
            if (handler.subscribe) {
                subscribeFn = (source, args, context, info) => {
                    const subscribeResolverData = { source, args, context, info };
                    return handler.subscribe(subscribeResolverData);
                };
            }
            else {
                subscribeFn = (source, args, context, info) => {
                    const subscribeResolverData = { source, args, context, info };
                    let topics;
                    if (typeof handler.topics === "function") {
                        const getTopics = handler.topics;
                        topics = getTopics(subscribeResolverData);
                    }
                    else {
                        topics = handler.topics;
                    }
                    const topicId = handler.topicId?.(subscribeResolverData);
                    let pubSubIterable;
                    if (!Array.isArray(topics)) {
                        pubSubIterable = pubSub.subscribe(topics, topicId);
                    }
                    else {
                        if (topics.length === 0) {
                            throw new MissingSubscriptionTopicsError(handler.target, handler.methodName);
                        }
                        pubSubIterable = Repeater.merge([
                            ...topics.map(topic => pubSub.subscribe(topic, topicId)),
                        ]);
                    }
                    if (!handler.filter) {
                        return pubSubIterable;
                    }
                    return pipe(pubSubIterable, filter(payload => {
                        const handlerData = { payload, args, context, info };
                        return handler.filter(handlerData);
                    }));
                };
            }
            fields[handler.schemaName].subscribe = wrapResolverWithAuthChecker(subscribeFn, container, handler.roles);
            return fields;
        }, basicFields);
    }
    static generateHandlerArgs(target, propertyName, params) {
        return params.reduce((args, param) => {
            if (param.kind === "arg" || (param.kind === "custom" && param.options?.arg)) {
                const input = param.kind === "arg" ? param : param.options.arg;
                const type = this.getGraphQLInputType(target, propertyName, input.getType(), input.typeOptions, input.index, input.name);
                const argDirectives = this.metadataStorage.argumentDirectives
                    .filter(it => it.target === target &&
                    it.fieldName === propertyName &&
                    it.parameterIndex === param.index)
                    .map(it => it.directive);
                args[input.name] = {
                    description: input.description,
                    type,
                    defaultValue: input.typeOptions.defaultValue,
                    deprecationReason: input.deprecationReason,
                    astNode: getInputValueDefinitionNode(input.name, type, argDirectives),
                };
            }
            else if (param.kind === "args") {
                const argumentType = this.metadataStorage.argumentTypes.find(it => it.target === param.getType());
                if (!argumentType) {
                    throw new Error(`The value used as a type of '@Args' for '${propertyName}' of '${target.name}' ` +
                        `is not a class decorated with '@ArgsType' decorator!`);
                }
                const inheritanceChainClasses = [argumentType.target];
                for (let superClass = argumentType.target; superClass.prototype !== undefined; superClass = Object.getPrototypeOf(superClass)) {
                    inheritanceChainClasses.push(superClass);
                }
                for (const argsTypeClass of inheritanceChainClasses.reverse()) {
                    const inheritedArgumentType = this.metadataStorage.argumentTypes.find(it => it.target === argsTypeClass);
                    if (inheritedArgumentType) {
                        this.mapArgFields(inheritedArgumentType, args);
                    }
                }
            }
            return args;
        }, {});
    }
    static mapArgFields(argumentType, args = {}) {
        const argumentInstance = new argumentType.target();
        argumentType.fields.forEach(field => {
            const defaultValue = this.getDefaultValue(argumentInstance, field.typeOptions, field.name, argumentType.name);
            const type = this.getGraphQLInputType(field.target, field.name, field.getType(), {
                ...field.typeOptions,
                defaultValue,
            });
            args[field.schemaName] = {
                description: field.description,
                type,
                defaultValue,
                astNode: getInputValueDefinitionNode(field.name, type, field.directives),
                extensions: field.extensions,
                deprecationReason: field.deprecationReason,
            };
        });
    }
    static getGraphQLOutputType(target, propertyName, type, typeOptions = {}) {
        let gqlType;
        gqlType = convertTypeIfScalar(type);
        if (!gqlType) {
            const objectType = this.objectTypesInfo.find(it => it.target === type);
            if (objectType) {
                gqlType = objectType.type;
            }
        }
        if (!gqlType) {
            const interfaceType = this.interfaceTypesInfo.find(it => it.target === type);
            if (interfaceType) {
                this.usedInterfaceTypes.add(interfaceType.target);
                gqlType = interfaceType.type;
            }
        }
        if (!gqlType) {
            const enumType = this.enumTypesInfo.find(it => it.enumObj === type);
            if (enumType) {
                gqlType = enumType.type;
            }
        }
        if (!gqlType) {
            const unionType = this.unionTypesInfo.find(it => it.unionSymbol === type);
            if (unionType) {
                gqlType = unionType.type;
            }
        }
        if (!gqlType) {
            throw new CannotDetermineGraphQLTypeError("output", target.name, propertyName);
        }
        const { nullableByDefault } = BuildContext;
        return wrapWithTypeOptions(target, propertyName, gqlType, typeOptions, nullableByDefault);
    }
    static getGraphQLInputType(target, propertyName, type, typeOptions = {}, parameterIndex, argName) {
        let gqlType;
        gqlType = convertTypeIfScalar(type);
        if (!gqlType) {
            const inputType = this.inputTypesInfo.find(it => it.target === type);
            if (inputType) {
                gqlType = inputType.type;
            }
        }
        if (!gqlType) {
            const enumType = this.enumTypesInfo.find(it => it.enumObj === type);
            if (enumType) {
                gqlType = enumType.type;
            }
        }
        if (!gqlType) {
            throw new CannotDetermineGraphQLTypeError("input", target.name, propertyName, parameterIndex, argName);
        }
        const { nullableByDefault } = BuildContext;
        return wrapWithTypeOptions(target, propertyName, gqlType, typeOptions, nullableByDefault);
    }
    static getResolveTypeFunction(resolveType, possibleObjectTypesInfo) {
        return async (...args) => {
            const resolvedType = await resolveType(...args);
            if (!resolvedType || typeof resolvedType === "string") {
                return resolvedType ?? undefined;
            }
            return possibleObjectTypesInfo.find(objectType => objectType.target === resolvedType)?.type
                .name;
        };
    }
    static filterHandlersByResolvers(handlers, resolvers) {
        return handlers.filter(query => resolvers.includes(query.target));
    }
    static filterTypesInfoByOrphanedTypesAndExtractType(typesInfo, orphanedTypes) {
        return typesInfo.filter(it => orphanedTypes.includes(it.target)).map(it => it.type);
    }
}
SchemaGenerator.objectTypesInfo = [];
SchemaGenerator.inputTypesInfo = [];
SchemaGenerator.interfaceTypesInfo = [];
SchemaGenerator.enumTypesInfo = [];
SchemaGenerator.unionTypesInfo = [];
SchemaGenerator.usedInterfaceTypes = new Set();
