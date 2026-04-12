/* tslint:disable */
/* eslint-disable */
import type { AdditionalProps, Tsoa, TsoaRoute } from 'tsoa-next';
import { fetchMiddlewares, HapiTemplateService } from 'tsoa-next';
import { ShippingQuoteController } from './../../../controllers/shippingQuoteController';
import { OrderDraftController } from './../../../controllers/orderDraftController';
import { ExternalValidationShowcaseController } from './../../../controllers/externalValidationShowcaseController';
import { CatalogLookupController } from './../../../controllers/catalogLookupController';
import { HapiMiddlewareShowcaseController } from './../../../controllers/hapi/hapiMiddlewareShowcaseController';
import { boomify, isBoom } from '@hapi/boom';
import type { Request, ResponseToolkit, RouteOptionsPreAllOptions, Server } from '@hapi/hapi';

type RouteErrorLike = {
  fields?: unknown;
  message?: unknown;
  name?: unknown;
  status?: unknown;
};

function isRouteErrorLike(value: unknown): value is RouteErrorLike {
  return typeof value === 'object' && value !== null;
}

function getErrorStatus(value: unknown): number {
  if (isRouteErrorLike(value) && typeof value.status === 'number') {
    return value.status;
  }

  return 500;
}

function getErrorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }

  if (isRouteErrorLike(value) && typeof value.message === 'string') {
    return value.message;
  }

  return 'An error occurred during the request.';
}

function getErrorName(value: unknown): string {
  if (value instanceof Error) {
    return value.name;
  }

  if (isRouteErrorLike(value) && typeof value.name === 'string') {
    return value.name;
  }

  return 'Error';
}

function toBoomError(error: unknown) {
  if (isBoom(error)) {
    return error;
  }

  const status = getErrorStatus(error);
  const message = getErrorMessage(error);
  const baseError = error instanceof Error ? error : new Error(message);
  const boomError = boomify(baseError, { statusCode: status });

  boomError.output.statusCode = status;
  Reflect.set(boomError.output.payload, 'name', getErrorName(error));
  Reflect.set(boomError.output.payload, 'message', message);

  if (isRouteErrorLike(error) && error.fields !== undefined) {
    Reflect.set(boomError.output.payload, 'fields', error.fields);
  }

  return boomError;
}

const models: TsoaRoute.Models = {
  "CarrierCode": {
    "dataType": "refAlias",
    "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["postal-priority"]},{"dataType":"enum","enums":["city-bike"]}],"validators":{}},
  },
  "ServiceLevelCode": {
    "dataType": "refAlias",
    "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["standard"]},{"dataType":"enum","enums":["expedited"]}],"validators":{}},
  },
  "SupportedCurrencyCode": {
    "dataType": "refAlias",
    "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["USD"]},{"dataType":"enum","enums":["EUR"]}],"validators":{}},
  },
  "ShippingQuoteView": {
    "dataType": "refObject",
    "properties": {
      "quoteId": {"dataType":"string","required":true},
      "carrierCode": {"ref":"CarrierCode","required":true},
      "serviceLevel": {"ref":"ServiceLevelCode","required":true},
      "destinationLabel": {"dataType":"string","required":true},
      "currency": {"ref":"SupportedCurrencyCode","required":true},
      "estimatedBusinessDays": {"dataType":"double","required":true},
      "quotedAmount": {"dataType":"double","required":true},
    },
    "additionalProperties": false,
  },
  "ShippingQuoteRequestQuery": {
    "dataType": "refObject",
    "properties": {
      "destinationCountryCode": {"dataType":"string","required":true},
      "destinationPostalCode": {"dataType":"string","required":true},
      "parcels": {"dataType":"double","required":true},
      "expedited": {"dataType":"boolean","required":true},
      "market": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["us"]},{"dataType":"enum","enums":["eu"]}],"required":true},
    },
    "additionalProperties": false,
  },
  "MoneyAmount": {
    "dataType": "refObject",
    "properties": {
      "currency": {"ref":"SupportedCurrencyCode","required":true},
      "amount": {"dataType":"double","required":true},
    },
    "additionalProperties": false,
  },
  "OrderDraftReceipt": {
    "dataType": "refObject",
    "properties": {
      "draftId": {"dataType":"string","required":true},
      "customerId": {"dataType":"string","required":true},
      "shippingPostalCode": {"dataType":"string","required":true},
      "status": {"dataType":"enum","enums":["draft"],"required":true},
      "lineCount": {"dataType":"double","required":true},
      "subtotal": {"ref":"MoneyAmount","required":true},
      "notes": {"dataType":"string"},
    },
    "additionalProperties": false,
  },
  "OrderLineInput": {
    "dataType": "refObject",
    "properties": {
      "sku": {"dataType":"string","required":true},
      "quantity": {"dataType":"double","required":true},
      "unitPrice": {"dataType":"double","required":true},
    },
    "additionalProperties": false,
  },
  "CreateOrderDraftRequest": {
    "dataType": "refObject",
    "properties": {
      "customerId": {"dataType":"string","required":true},
      "requestedCurrency": {"ref":"SupportedCurrencyCode","required":true},
      "shippingPostalCode": {"dataType":"string","required":true},
      "notes": {"dataType":"string"},
      "lines": {"dataType":"array","array":{"dataType":"refObject","ref":"OrderLineInput"},"required":true},
    },
    "additionalProperties": false,
  },
  "DraftPricingView": {
    "dataType": "refObject",
    "properties": {
      "currency": {"ref":"SupportedCurrencyCode","required":true},
      "subtotal": {"ref":"MoneyAmount","required":true},
      "tax": {"ref":"MoneyAmount","required":true},
      "grandTotal": {"ref":"MoneyAmount","required":true},
    },
    "additionalProperties": false,
  },
  "ValidationLifecycleStatus": {
    "dataType": "refAlias",
    "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["disabled"]}],"validators":{}},
  },
  "TaggedEntityPayload": {
    "dataType": "refObject",
    "properties": {
      "name": {"dataType":"string","required":true},
      "status": {"ref":"ValidationLifecycleStatus","required":true},
      "tags": {"dataType":"array","array":{"dataType":"string"},"required":true},
    },
    "additionalProperties": false,
  },
  "AuditedTaggedEntityPayload": {
    "dataType": "refObject",
    "properties": {
      "name": {"dataType":"string","required":true},
      "status": {"ref":"ValidationLifecycleStatus","required":true},
      "tags": {"dataType":"array","array":{"dataType":"string"},"required":true},
      "auditId": {"dataType":"double","required":true},
    },
    "additionalProperties": false,
  },
  "Branded_number.PositiveFloatBrand_": {
    "dataType": "refAlias",
    "type": {"dataType":"intersection","subSchemas":[{"dataType":"double"}],"validators":{}},
  },
  "Branded_number.IntBrand_": {
    "dataType": "refAlias",
    "type": {"dataType":"intersection","subSchemas":[{"dataType":"double"}],"validators":{}},
  },
  "Branded_Branded_number.IntBrand_.PositiveIntegerBrand_": {
    "dataType": "refAlias",
    "type": {"dataType":"intersection","subSchemas":[{"ref":"Branded_number.IntBrand_"}],"validators":{}},
  },
  "WagerSubmission": {
    "dataType": "refAlias",
    "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"outcome":{"ref":"Branded_Branded_number.IntBrand_.PositiveIntegerBrand_","required":true},"amount":{"ref":"Branded_number.PositiveFloatBrand_","required":true}},"validators":{}},
  },
  "MarketCode": {
    "dataType": "refAlias",
    "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["us"]},{"dataType":"enum","enums":["eu"]}],"validators":{}},
  },
  "CatalogItemView": {
    "dataType": "refObject",
    "properties": {
      "sku": {"dataType":"string","required":true},
      "title": {"dataType":"string","required":true},
      "market": {"ref":"MarketCode","required":true},
      "warehouse": {"dataType":"string","required":true},
      "merchandisingLabel": {"dataType":"string","required":true},
      "availableUnits": {"dataType":"double","required":true},
      "unitPrice": {"ref":"MoneyAmount","required":true},
    },
    "additionalProperties": false,
  },
  "FeaturedCatalogEnvelope": {
    "dataType": "refObject",
    "properties": {
      "audience": {"dataType":"string","required":true},
      "generatedAt": {"dataType":"datetime","required":true},
      "items": {"dataType":"array","array":{"dataType":"refObject","ref":"CatalogItemView"},"required":true},
    },
    "additionalProperties": false,
  },
  "MiddlewareTraceView": {
    "dataType": "refObject",
    "properties": {
      "events": {"dataType":"array","array":{"dataType":"string"},"required":true},
      "framework": {"dataType":"string","required":true},
    },
    "additionalProperties": false,
  },
};

export function RegisterRoutes(server: Server, opts?: { validation?: Tsoa.ValidationContext }) {
  const additionalProps: AdditionalProps = {
    ...{"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true},
    validation: opts?.validation,
  };
  const templateService = new HapiTemplateService(models, additionalProps, { boomify, isBoom });

  const argsShippingQuoteController_getShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"queries","name":"request","parameterIndex":0,"required":true,"ref":"ShippingQuoteRequestQuery"},
  };

  server.route({
    method: 'get',
    path: '/v1/shipping/quote',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ShippingQuoteController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ShippingQuoteController.prototype.getShippingQuote)),
      ],
      handler: async function ShippingQuoteController_getShippingQuote(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsShippingQuoteController_getShippingQuote,
            controllerClass: ShippingQuoteController,
            methodName: 'getShippingQuote',
            request,
            h,
          });

          const controller = new ShippingQuoteController();
          return templateService.apiHandler({
            methodName: 'getShippingQuote',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsShippingQuoteController_getCarrierShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
    carrierCode: {"in":"path","name":"carrierCode","parameterIndex":0,"required":true,"ref":"CarrierCode"},
    request: {"in":"queries","name":"request","parameterIndex":1,"required":true,"ref":"ShippingQuoteRequestQuery"},
  };

  server.route({
    method: 'get',
    path: '/v1/shipping/carriers/{carrierCode}/quote',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ShippingQuoteController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ShippingQuoteController.prototype.getCarrierShippingQuote)),
      ],
      handler: async function ShippingQuoteController_getCarrierShippingQuote(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsShippingQuoteController_getCarrierShippingQuote,
            controllerClass: ShippingQuoteController,
            methodName: 'getCarrierShippingQuote',
            request,
            h,
          });

          const controller = new ShippingQuoteController();
          return templateService.apiHandler({
            methodName: 'getCarrierShippingQuote',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsOrderDraftController_createOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
  };

  server.route({
    method: 'post',
    path: '/v1/order-drafts',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(OrderDraftController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(OrderDraftController.prototype.createOrderDraft)),
      ],
      handler: async function OrderDraftController_createOrderDraft(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsOrderDraftController_createOrderDraft,
            controllerClass: OrderDraftController,
            methodName: 'createOrderDraft',
            request,
            h,
          });

          const controller = new OrderDraftController();
          return templateService.apiHandler({
            methodName: 'createOrderDraft',
            controller,
            h,
            validatedArgs,
            successStatus: 201,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsOrderDraftController_getOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    draftId: {"in":"path","name":"draftId","parameterIndex":0,"required":true,"dataType":"string"},
  };

  server.route({
    method: 'get',
    path: '/v1/order-drafts/{draftId}',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(OrderDraftController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(OrderDraftController.prototype.getOrderDraft)),
      ],
      handler: async function OrderDraftController_getOrderDraft(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsOrderDraftController_getOrderDraft,
            controllerClass: OrderDraftController,
            methodName: 'getOrderDraft',
            request,
            h,
          });

          const controller = new OrderDraftController();
          return templateService.apiHandler({
            methodName: 'getOrderDraft',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsOrderDraftController_priceOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
    currency: {"default":"USD","in":"query","name":"currency","parameterIndex":1,"ref":"SupportedCurrencyCode"},
  };

  server.route({
    method: 'post',
    path: '/v1/order-drafts/pricing',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(OrderDraftController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(OrderDraftController.prototype.priceOrderDraft)),
      ],
      handler: async function OrderDraftController_priceOrderDraft(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsOrderDraftController_priceOrderDraft,
            controllerClass: OrderDraftController,
            methodName: 'priceOrderDraft',
            request,
            h,
          });

          const controller = new OrderDraftController();
          return templateService.apiHandler({
            methodName: 'priceOrderDraft',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsExternalValidationShowcaseController_validateWithZod: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"zod","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
  };

  server.route({
    method: 'post',
    path: '/v1/validation/external/zod',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController.prototype.validateWithZod)),
      ],
      handler: async function ExternalValidationShowcaseController_validateWithZod(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsExternalValidationShowcaseController_validateWithZod,
            controllerClass: ExternalValidationShowcaseController,
            methodName: 'validateWithZod',
            request,
            h,
          });

          const controller = new ExternalValidationShowcaseController();
          return templateService.apiHandler({
            methodName: 'validateWithZod',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsExternalValidationShowcaseController_validateWithJoi: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"joi","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
  };

  server.route({
    method: 'post',
    path: '/v1/validation/external/joi',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController.prototype.validateWithJoi)),
      ],
      handler: async function ExternalValidationShowcaseController_validateWithJoi(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsExternalValidationShowcaseController_validateWithJoi,
            controllerClass: ExternalValidationShowcaseController,
            methodName: 'validateWithJoi',
            request,
            h,
          });

          const controller = new ExternalValidationShowcaseController();
          return templateService.apiHandler({
            methodName: 'validateWithJoi',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsExternalValidationShowcaseController_validateWithYup: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"yup","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
  };

  server.route({
    method: 'post',
    path: '/v1/validation/external/yup',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController.prototype.validateWithYup)),
      ],
      handler: async function ExternalValidationShowcaseController_validateWithYup(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsExternalValidationShowcaseController_validateWithYup,
            controllerClass: ExternalValidationShowcaseController,
            methodName: 'validateWithYup',
            request,
            h,
          });

          const controller = new ExternalValidationShowcaseController();
          return templateService.apiHandler({
            methodName: 'validateWithYup',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsExternalValidationShowcaseController_validateWithSuperstruct: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"superstruct","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
  };

  server.route({
    method: 'post',
    path: '/v1/validation/external/superstruct',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController.prototype.validateWithSuperstruct)),
      ],
      handler: async function ExternalValidationShowcaseController_validateWithSuperstruct(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsExternalValidationShowcaseController_validateWithSuperstruct,
            controllerClass: ExternalValidationShowcaseController,
            methodName: 'validateWithSuperstruct',
            request,
            h,
          });

          const controller = new ExternalValidationShowcaseController();
          return templateService.apiHandler({
            methodName: 'validateWithSuperstruct',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsExternalValidationShowcaseController_validateWithIoTs: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"io-ts","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"WagerSubmission"},
  };

  server.route({
    method: 'post',
    path: '/v1/validation/external/ioTs',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(ExternalValidationShowcaseController.prototype.validateWithIoTs)),
      ],
      handler: async function ExternalValidationShowcaseController_validateWithIoTs(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsExternalValidationShowcaseController_validateWithIoTs,
            controllerClass: ExternalValidationShowcaseController,
            methodName: 'validateWithIoTs',
            request,
            h,
          });

          const controller = new ExternalValidationShowcaseController();
          return templateService.apiHandler({
            methodName: 'validateWithIoTs',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsCatalogLookupController_getFeaturedCatalog: Record<string, TsoaRoute.ParameterSchema> = {
    audience: {"default":"retail","in":"query","name":"audience","parameterIndex":0,"dataType":"string"},
  };

  server.route({
    method: 'get',
    path: '/v1/catalog/featured',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(CatalogLookupController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(CatalogLookupController.prototype.getFeaturedCatalog)),
      ],
      handler: async function CatalogLookupController_getFeaturedCatalog(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsCatalogLookupController_getFeaturedCatalog,
            controllerClass: CatalogLookupController,
            methodName: 'getFeaturedCatalog',
            request,
            h,
          });

          const controller = new CatalogLookupController();
          return templateService.apiHandler({
            methodName: 'getFeaturedCatalog',
            controller,
            h,
            validatedArgs,
            successStatus: 200,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsCatalogLookupController_getCatalogItem: Record<string, TsoaRoute.ParameterSchema> = {
    sku: {"in":"path","name":"sku","parameterIndex":0,"required":true,"dataType":"string"},
    market: {"default":"us","in":"header","name":"x-market","parameterIndex":1,"ref":"MarketCode"},
    warehouse: {"in":"query","name":"warehouse","parameterIndex":2,"dataType":"string"},
  };

  server.route({
    method: 'get',
    path: '/v1/catalog/{sku}',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(CatalogLookupController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(CatalogLookupController.prototype.getCatalogItem)),
      ],
      handler: async function CatalogLookupController_getCatalogItem(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsCatalogLookupController_getCatalogItem,
            controllerClass: CatalogLookupController,
            methodName: 'getCatalogItem',
            request,
            h,
          });

          const controller = new CatalogLookupController();
          return templateService.apiHandler({
            methodName: 'getCatalogItem',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });

  const argsHapiMiddlewareShowcaseController_getTrace: Record<string, TsoaRoute.ParameterSchema> = {
  };

  server.route({
    method: 'get',
    path: '/v1/middleware/hapi/trace',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(HapiMiddlewareShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(HapiMiddlewareShowcaseController.prototype.getTrace)),
      ],
      handler: async function HapiMiddlewareShowcaseController_getTrace(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsHapiMiddlewareShowcaseController_getTrace,
            controllerClass: HapiMiddlewareShowcaseController,
            methodName: 'getTrace',
            request,
            h,
          });

          const controller = new HapiMiddlewareShowcaseController();
          return templateService.apiHandler({
            methodName: 'getTrace',
            controller,
            h,
            validatedArgs,
            successStatus: undefined,
          });
        } catch (error) {
          throw toBoomError(error);
        }
      },
    },
  });
}
