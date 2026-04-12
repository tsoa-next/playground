/* tslint:disable */
/* eslint-disable */
import type { AdditionalProps, Tsoa, TsoaRoute } from 'tsoa-next';
import { createOpenApiSpecGenerator, fetchMiddlewares, fetchSpecPaths, KoaTemplateService, normalisePath, resolveSpecPathResponse } from 'tsoa-next';
import { SpecPathShowcaseController } from './../../../controllers/specPathShowcaseController';
import { ShippingQuoteController } from './../../../controllers/shippingQuoteController';
import { OrderDraftController } from './../../../controllers/orderDraftController';
import { ExternalValidationShowcaseController } from './../../../controllers/externalValidationShowcaseController';
import { CatalogLookupController } from './../../../controllers/catalogLookupController';
import { KoaMiddlewareShowcaseController } from './../../../controllers/koa/koaMiddlewareShowcaseController';
import type Router from '@koa/router';
import type { Context, Middleware, Next } from 'koa';

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

function getErrorBody(value: unknown) {
  const status = getErrorStatus(value);
  const body: {
    fields?: unknown;
    message: string;
    name: string;
    status: number;
  } = {
    message: getErrorMessage(value),
    name: getErrorName(value),
    status,
  };

  if (isRouteErrorLike(value) && value.fields !== undefined) {
    body.fields = value.fields;
  }

  return body;
}

const models: TsoaRoute.Models = {
  "SpecPathShowcaseStateView": {
    "dataType": "refObject",
    "properties": {
      "customCacheGets": {"dataType":"double","required":true},
      "customCacheSets": {"dataType":"double","required":true},
      "customStreamCalls": {"dataType":"double","required":true},
      "customStringCalls": {"dataType":"double","required":true},
    },
    "additionalProperties": false,
  },
  "SpecPathShowcaseStatusView": {
    "dataType": "refObject",
    "properties": {
      "availableDocsTargets": {"dataType":"array","array":{"dataType":"string"},"required":true},
      "availableSpecTargets": {"dataType":"array","array":{"dataType":"string"},"required":true},
      "state": {"ref":"SpecPathShowcaseStateView","required":true},
    },
    "additionalProperties": false,
  },
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

export function RegisterRoutes(router: Router, opts?: { validation?: Tsoa.ValidationContext }) {
  const additionalProps: AdditionalProps = {
    ...{"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true},
    validation: opts?.validation,
  };
  const templateService = new KoaTemplateService(models, additionalProps);
  const specGenerator = createOpenApiSpecGenerator({"spec":{"outputDirectory":"./src/specs","specFileBaseName":"koaApi","specVersion":3.1,"yaml":true,"name":"tsoa-next Playground API","description":"Reference controllers inspired by tsoa-next upstream fixtures, exposed through Express, Koa, and Hapi.","version":"1.0.0","schemes":["http"],"servers":["127.0.0.1:3102"],"basePath":"/v1","operationIdTemplate":"{{controllerName}}_{{titleCase method.name}}","license":"MIT","contact":{"name":"Vanna DiCatania","email":"vanna@dicatania.me"},"noImplicitAdditionalProperties":"throw-on-extras","entryFile":"./src/tsoaEntry.ts","controllerPathGlobs":["./src/controllers/*Controller.ts","./src/controllers/koa/*Controller.ts"]}});
  const registeredGetPaths = new Set<string>(["/v1/specPath","/v1/specPath/state","/v1/shipping/quote","/v1/shipping/carriers/:carrierCode/quote","/v1/order-drafts/:draftId","/v1/catalog/featured","/v1/catalog/:sku","/v1/middleware/koa/trace"]);

  const argsSpecPathShowcaseController_getSpecPathStatus: Record<string, TsoaRoute.ParameterSchema> = {
  };

  router.get(
    '/v1/specPath',
    ...(fetchMiddlewares<Middleware>(SpecPathShowcaseController)),
    ...(fetchMiddlewares<Middleware>(SpecPathShowcaseController.prototype.getSpecPathStatus)),
    async function SpecPathShowcaseController_getSpecPathStatus(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsSpecPathShowcaseController_getSpecPathStatus,
          controllerClass: SpecPathShowcaseController,
          methodName: 'getSpecPathStatus',
          context,
          next,
        });

        const controller = new SpecPathShowcaseController();
        return templateService.apiHandler({
          methodName: 'getSpecPathStatus',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsSpecPathShowcaseController_getSpecPathState: Record<string, TsoaRoute.ParameterSchema> = {
  };

  router.get(
    '/v1/specPath/state',
    ...(fetchMiddlewares<Middleware>(SpecPathShowcaseController)),
    ...(fetchMiddlewares<Middleware>(SpecPathShowcaseController.prototype.getSpecPathState)),
    async function SpecPathShowcaseController_getSpecPathState(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsSpecPathShowcaseController_getSpecPathState,
          controllerClass: SpecPathShowcaseController,
          methodName: 'getSpecPathState',
          context,
          next,
        });

        const controller = new SpecPathShowcaseController();
        return templateService.apiHandler({
          methodName: 'getSpecPathState',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsSpecPathShowcaseController_resetState: Record<string, TsoaRoute.ParameterSchema> = {
  };

  router.post(
    '/v1/specPath/state/reset',
    ...(fetchMiddlewares<Middleware>(SpecPathShowcaseController)),
    ...(fetchMiddlewares<Middleware>(SpecPathShowcaseController.prototype.resetState)),
    async function SpecPathShowcaseController_resetState(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsSpecPathShowcaseController_resetState,
          controllerClass: SpecPathShowcaseController,
          methodName: 'resetState',
          context,
          next,
        });

        const controller = new SpecPathShowcaseController();
        return templateService.apiHandler({
          methodName: 'resetState',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsShippingQuoteController_getShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"queries","name":"request","parameterIndex":0,"required":true,"ref":"ShippingQuoteRequestQuery"},
  };

  router.get(
    '/v1/shipping/quote',
    ...(fetchMiddlewares<Middleware>(ShippingQuoteController)),
    ...(fetchMiddlewares<Middleware>(ShippingQuoteController.prototype.getShippingQuote)),
    async function ShippingQuoteController_getShippingQuote(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsShippingQuoteController_getShippingQuote,
          controllerClass: ShippingQuoteController,
          methodName: 'getShippingQuote',
          context,
          next,
        });

        const controller = new ShippingQuoteController();
        return templateService.apiHandler({
          methodName: 'getShippingQuote',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsShippingQuoteController_getCarrierShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
    carrierCode: {"in":"path","name":"carrierCode","parameterIndex":0,"required":true,"ref":"CarrierCode"},
    request: {"in":"queries","name":"request","parameterIndex":1,"required":true,"ref":"ShippingQuoteRequestQuery"},
  };

  router.get(
    '/v1/shipping/carriers/:carrierCode/quote',
    ...(fetchMiddlewares<Middleware>(ShippingQuoteController)),
    ...(fetchMiddlewares<Middleware>(ShippingQuoteController.prototype.getCarrierShippingQuote)),
    async function ShippingQuoteController_getCarrierShippingQuote(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsShippingQuoteController_getCarrierShippingQuote,
          controllerClass: ShippingQuoteController,
          methodName: 'getCarrierShippingQuote',
          context,
          next,
        });

        const controller = new ShippingQuoteController();
        return templateService.apiHandler({
          methodName: 'getCarrierShippingQuote',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsOrderDraftController_createOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
  };

  router.post(
    '/v1/order-drafts',
    ...(fetchMiddlewares<Middleware>(OrderDraftController)),
    ...(fetchMiddlewares<Middleware>(OrderDraftController.prototype.createOrderDraft)),
    async function OrderDraftController_createOrderDraft(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsOrderDraftController_createOrderDraft,
          controllerClass: OrderDraftController,
          methodName: 'createOrderDraft',
          context,
          next,
        });

        const controller = new OrderDraftController();
        return templateService.apiHandler({
          methodName: 'createOrderDraft',
          controller,
          context,
          validatedArgs,
          successStatus: 201,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsOrderDraftController_getOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    draftId: {"in":"path","name":"draftId","parameterIndex":0,"required":true,"dataType":"string"},
  };

  router.get(
    '/v1/order-drafts/:draftId',
    ...(fetchMiddlewares<Middleware>(OrderDraftController)),
    ...(fetchMiddlewares<Middleware>(OrderDraftController.prototype.getOrderDraft)),
    async function OrderDraftController_getOrderDraft(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsOrderDraftController_getOrderDraft,
          controllerClass: OrderDraftController,
          methodName: 'getOrderDraft',
          context,
          next,
        });

        const controller = new OrderDraftController();
        return templateService.apiHandler({
          methodName: 'getOrderDraft',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsOrderDraftController_priceOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
    currency: {"default":"USD","in":"query","name":"currency","parameterIndex":1,"ref":"SupportedCurrencyCode"},
  };

  router.post(
    '/v1/order-drafts/pricing',
    ...(fetchMiddlewares<Middleware>(OrderDraftController)),
    ...(fetchMiddlewares<Middleware>(OrderDraftController.prototype.priceOrderDraft)),
    async function OrderDraftController_priceOrderDraft(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsOrderDraftController_priceOrderDraft,
          controllerClass: OrderDraftController,
          methodName: 'priceOrderDraft',
          context,
          next,
        });

        const controller = new OrderDraftController();
        return templateService.apiHandler({
          methodName: 'priceOrderDraft',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithZod: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"zod","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/zod',
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController.prototype.validateWithZod)),
    async function ExternalValidationShowcaseController_validateWithZod(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithZod,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithZod',
          context,
          next,
        });

        const controller = new ExternalValidationShowcaseController();
        return templateService.apiHandler({
          methodName: 'validateWithZod',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithJoi: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"joi","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/joi',
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController.prototype.validateWithJoi)),
    async function ExternalValidationShowcaseController_validateWithJoi(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithJoi,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithJoi',
          context,
          next,
        });

        const controller = new ExternalValidationShowcaseController();
        return templateService.apiHandler({
          methodName: 'validateWithJoi',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithYup: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"yup","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/yup',
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController.prototype.validateWithYup)),
    async function ExternalValidationShowcaseController_validateWithYup(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithYup,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithYup',
          context,
          next,
        });

        const controller = new ExternalValidationShowcaseController();
        return templateService.apiHandler({
          methodName: 'validateWithYup',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithSuperstruct: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"superstruct","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/superstruct',
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController.prototype.validateWithSuperstruct)),
    async function ExternalValidationShowcaseController_validateWithSuperstruct(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithSuperstruct,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithSuperstruct',
          context,
          next,
        });

        const controller = new ExternalValidationShowcaseController();
        return templateService.apiHandler({
          methodName: 'validateWithSuperstruct',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithIoTs: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"io-ts","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"WagerSubmission"},
  };

  router.post(
    '/v1/validation/external/ioTs',
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<Middleware>(ExternalValidationShowcaseController.prototype.validateWithIoTs)),
    async function ExternalValidationShowcaseController_validateWithIoTs(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithIoTs,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithIoTs',
          context,
          next,
        });

        const controller = new ExternalValidationShowcaseController();
        return templateService.apiHandler({
          methodName: 'validateWithIoTs',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsCatalogLookupController_getFeaturedCatalog: Record<string, TsoaRoute.ParameterSchema> = {
    audience: {"default":"retail","in":"query","name":"audience","parameterIndex":0,"dataType":"string"},
  };

  router.get(
    '/v1/catalog/featured',
    ...(fetchMiddlewares<Middleware>(CatalogLookupController)),
    ...(fetchMiddlewares<Middleware>(CatalogLookupController.prototype.getFeaturedCatalog)),
    async function CatalogLookupController_getFeaturedCatalog(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsCatalogLookupController_getFeaturedCatalog,
          controllerClass: CatalogLookupController,
          methodName: 'getFeaturedCatalog',
          context,
          next,
        });

        const controller = new CatalogLookupController();
        return templateService.apiHandler({
          methodName: 'getFeaturedCatalog',
          controller,
          context,
          validatedArgs,
          successStatus: 200,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsCatalogLookupController_getCatalogItem: Record<string, TsoaRoute.ParameterSchema> = {
    sku: {"in":"path","name":"sku","parameterIndex":0,"required":true,"dataType":"string"},
    market: {"default":"us","in":"header","name":"x-market","parameterIndex":1,"ref":"MarketCode"},
    warehouse: {"in":"query","name":"warehouse","parameterIndex":2,"dataType":"string"},
  };

  router.get(
    '/v1/catalog/:sku',
    ...(fetchMiddlewares<Middleware>(CatalogLookupController)),
    ...(fetchMiddlewares<Middleware>(CatalogLookupController.prototype.getCatalogItem)),
    async function CatalogLookupController_getCatalogItem(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsCatalogLookupController_getCatalogItem,
          controllerClass: CatalogLookupController,
          methodName: 'getCatalogItem',
          context,
          next,
        });

        const controller = new CatalogLookupController();
        return templateService.apiHandler({
          methodName: 'getCatalogItem',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );

  const argsKoaMiddlewareShowcaseController_getTrace: Record<string, TsoaRoute.ParameterSchema> = {
  };

  router.get(
    '/v1/middleware/koa/trace',
    ...(fetchMiddlewares<Middleware>(KoaMiddlewareShowcaseController)),
    ...(fetchMiddlewares<Middleware>(KoaMiddlewareShowcaseController.prototype.getTrace)),
    async function KoaMiddlewareShowcaseController_getTrace(context: Context, next: Next) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsKoaMiddlewareShowcaseController_getTrace,
          controllerClass: KoaMiddlewareShowcaseController,
          methodName: 'getTrace',
          context,
          next,
        });

        const controller = new KoaMiddlewareShowcaseController();
        return templateService.apiHandler({
          methodName: 'getTrace',
          controller,
          context,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        const body = getErrorBody(error);
        context.status = body.status;
        context.body = body;
        return;
      }
    },
  );
  for (const specPath of fetchSpecPaths(SpecPathShowcaseController)) {
    const specFullPath = normalisePath('/v1/specPath' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for SpecPathShowcaseController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    router.get(
      specFullPath,
      async function SpecPathShowcaseController_specPath(context: Context, _next: Next) {
        try {
          const specResponse = await resolveSpecPathResponse({
            controllerClass: SpecPathShowcaseController,
            fullPath: specFullPath,
            request: context.request,
            response: context.response,
            runtime: 'koa',
            specGenerator,
            specPath,
          });

          if (specResponse.contentType) {
            context.type = specResponse.contentType;
          }

          context.status = 200;
          context.body = specResponse.body;
          return;
        } catch (error) {
          const body = getErrorBody(error);
          context.status = body.status;
          context.body = body;
          return;
        }
      },
    );
  }
  for (const specPath of fetchSpecPaths(ShippingQuoteController)) {
    const specFullPath = normalisePath('/v1/shipping' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for ShippingQuoteController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    router.get(
      specFullPath,
      async function ShippingQuoteController_specPath(context: Context, _next: Next) {
        try {
          const specResponse = await resolveSpecPathResponse({
            controllerClass: ShippingQuoteController,
            fullPath: specFullPath,
            request: context.request,
            response: context.response,
            runtime: 'koa',
            specGenerator,
            specPath,
          });

          if (specResponse.contentType) {
            context.type = specResponse.contentType;
          }

          context.status = 200;
          context.body = specResponse.body;
          return;
        } catch (error) {
          const body = getErrorBody(error);
          context.status = body.status;
          context.body = body;
          return;
        }
      },
    );
  }
  for (const specPath of fetchSpecPaths(OrderDraftController)) {
    const specFullPath = normalisePath('/v1/order-drafts' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for OrderDraftController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    router.get(
      specFullPath,
      async function OrderDraftController_specPath(context: Context, _next: Next) {
        try {
          const specResponse = await resolveSpecPathResponse({
            controllerClass: OrderDraftController,
            fullPath: specFullPath,
            request: context.request,
            response: context.response,
            runtime: 'koa',
            specGenerator,
            specPath,
          });

          if (specResponse.contentType) {
            context.type = specResponse.contentType;
          }

          context.status = 200;
          context.body = specResponse.body;
          return;
        } catch (error) {
          const body = getErrorBody(error);
          context.status = body.status;
          context.body = body;
          return;
        }
      },
    );
  }
  for (const specPath of fetchSpecPaths(ExternalValidationShowcaseController)) {
    const specFullPath = normalisePath('/v1/validation/external' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for ExternalValidationShowcaseController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    router.get(
      specFullPath,
      async function ExternalValidationShowcaseController_specPath(context: Context, _next: Next) {
        try {
          const specResponse = await resolveSpecPathResponse({
            controllerClass: ExternalValidationShowcaseController,
            fullPath: specFullPath,
            request: context.request,
            response: context.response,
            runtime: 'koa',
            specGenerator,
            specPath,
          });

          if (specResponse.contentType) {
            context.type = specResponse.contentType;
          }

          context.status = 200;
          context.body = specResponse.body;
          return;
        } catch (error) {
          const body = getErrorBody(error);
          context.status = body.status;
          context.body = body;
          return;
        }
      },
    );
  }
  for (const specPath of fetchSpecPaths(CatalogLookupController)) {
    const specFullPath = normalisePath('/v1/catalog' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for CatalogLookupController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    router.get(
      specFullPath,
      async function CatalogLookupController_specPath(context: Context, _next: Next) {
        try {
          const specResponse = await resolveSpecPathResponse({
            controllerClass: CatalogLookupController,
            fullPath: specFullPath,
            request: context.request,
            response: context.response,
            runtime: 'koa',
            specGenerator,
            specPath,
          });

          if (specResponse.contentType) {
            context.type = specResponse.contentType;
          }

          context.status = 200;
          context.body = specResponse.body;
          return;
        } catch (error) {
          const body = getErrorBody(error);
          context.status = body.status;
          context.body = body;
          return;
        }
      },
    );
  }
  for (const specPath of fetchSpecPaths(KoaMiddlewareShowcaseController)) {
    const specFullPath = normalisePath('/v1/middleware/koa' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for KoaMiddlewareShowcaseController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    router.get(
      specFullPath,
      async function KoaMiddlewareShowcaseController_specPath(context: Context, _next: Next) {
        try {
          const specResponse = await resolveSpecPathResponse({
            controllerClass: KoaMiddlewareShowcaseController,
            fullPath: specFullPath,
            request: context.request,
            response: context.response,
            runtime: 'koa',
            specGenerator,
            specPath,
          });

          if (specResponse.contentType) {
            context.type = specResponse.contentType;
          }

          context.status = 200;
          context.body = specResponse.body;
          return;
        } catch (error) {
          const body = getErrorBody(error);
          context.status = body.status;
          context.body = body;
          return;
        }
      },
    );
  }
}
