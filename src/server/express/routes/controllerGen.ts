/* tslint:disable */
/* eslint-disable */
import type { AdditionalProps, Tsoa, TsoaRoute } from 'tsoa-next';
import { ExpressTemplateService, fetchMiddlewares } from 'tsoa-next';
import { ShippingQuoteController } from './../../../controllers/shippingQuoteController';
import { OrderDraftController } from './../../../controllers/orderDraftController';
import { ExternalValidationShowcaseController } from './../../../controllers/externalValidationShowcaseController';
import { CatalogLookupController } from './../../../controllers/catalogLookupController';
import { ExpressMiddlewareShowcaseController } from './../../../controllers/express/expressMiddlewareShowcaseController';
import type { NextFunction, Request, RequestHandler, Response, Router } from 'express';

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

export function RegisterRoutes(router: Router, opts?: { validation?: Tsoa.ValidationContext }) {
  const additionalProps: AdditionalProps = {
    ...{"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true},
    validation: opts?.validation,
  };
  const templateService = new ExpressTemplateService(models, additionalProps);

  const argsShippingQuoteController_getShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"queries","name":"request","parameterIndex":0,"required":true,"ref":"ShippingQuoteRequestQuery"},
  };

  router.get(
    '/v1/shipping/quote',
    ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController)),
    ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController.prototype.getShippingQuote)),
    async function ShippingQuoteController_getShippingQuote(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsShippingQuoteController_getShippingQuote,
          controllerClass: ShippingQuoteController,
          methodName: 'getShippingQuote',
          request,
          response,
        });

        const controller = new ShippingQuoteController();
        await templateService.apiHandler({
          methodName: 'getShippingQuote',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsShippingQuoteController_getCarrierShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
    carrierCode: {"in":"path","name":"carrierCode","parameterIndex":0,"required":true,"ref":"CarrierCode"},
    request: {"in":"queries","name":"request","parameterIndex":1,"required":true,"ref":"ShippingQuoteRequestQuery"},
  };

  router.get(
    '/v1/shipping/carriers/:carrierCode/quote',
    ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController)),
    ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController.prototype.getCarrierShippingQuote)),
    async function ShippingQuoteController_getCarrierShippingQuote(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsShippingQuoteController_getCarrierShippingQuote,
          controllerClass: ShippingQuoteController,
          methodName: 'getCarrierShippingQuote',
          request,
          response,
        });

        const controller = new ShippingQuoteController();
        await templateService.apiHandler({
          methodName: 'getCarrierShippingQuote',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsOrderDraftController_createOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
  };

  router.post(
    '/v1/order-drafts',
    ...(fetchMiddlewares<RequestHandler>(OrderDraftController)),
    ...(fetchMiddlewares<RequestHandler>(OrderDraftController.prototype.createOrderDraft)),
    async function OrderDraftController_createOrderDraft(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsOrderDraftController_createOrderDraft,
          controllerClass: OrderDraftController,
          methodName: 'createOrderDraft',
          request,
          response,
        });

        const controller = new OrderDraftController();
        await templateService.apiHandler({
          methodName: 'createOrderDraft',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsOrderDraftController_getOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    draftId: {"in":"path","name":"draftId","parameterIndex":0,"required":true,"dataType":"string"},
  };

  router.get(
    '/v1/order-drafts/:draftId',
    ...(fetchMiddlewares<RequestHandler>(OrderDraftController)),
    ...(fetchMiddlewares<RequestHandler>(OrderDraftController.prototype.getOrderDraft)),
    async function OrderDraftController_getOrderDraft(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsOrderDraftController_getOrderDraft,
          controllerClass: OrderDraftController,
          methodName: 'getOrderDraft',
          request,
          response,
        });

        const controller = new OrderDraftController();
        await templateService.apiHandler({
          methodName: 'getOrderDraft',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsOrderDraftController_priceOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
    request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
    currency: {"default":"USD","in":"query","name":"currency","parameterIndex":1,"ref":"SupportedCurrencyCode"},
  };

  router.post(
    '/v1/order-drafts/pricing',
    ...(fetchMiddlewares<RequestHandler>(OrderDraftController)),
    ...(fetchMiddlewares<RequestHandler>(OrderDraftController.prototype.priceOrderDraft)),
    async function OrderDraftController_priceOrderDraft(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsOrderDraftController_priceOrderDraft,
          controllerClass: OrderDraftController,
          methodName: 'priceOrderDraft',
          request,
          response,
        });

        const controller = new OrderDraftController();
        await templateService.apiHandler({
          methodName: 'priceOrderDraft',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithZod: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"zod","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/zod',
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithZod)),
    async function ExternalValidationShowcaseController_validateWithZod(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithZod,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithZod',
          request,
          response,
        });

        const controller = new ExternalValidationShowcaseController();
        await templateService.apiHandler({
          methodName: 'validateWithZod',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithJoi: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"joi","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/joi',
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithJoi)),
    async function ExternalValidationShowcaseController_validateWithJoi(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithJoi,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithJoi',
          request,
          response,
        });

        const controller = new ExternalValidationShowcaseController();
        await templateService.apiHandler({
          methodName: 'validateWithJoi',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithYup: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"yup","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/yup',
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithYup)),
    async function ExternalValidationShowcaseController_validateWithYup(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithYup,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithYup',
          request,
          response,
        });

        const controller = new ExternalValidationShowcaseController();
        await templateService.apiHandler({
          methodName: 'validateWithYup',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithSuperstruct: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"superstruct","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
  };

  router.post(
    '/v1/validation/external/superstruct',
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithSuperstruct)),
    async function ExternalValidationShowcaseController_validateWithSuperstruct(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithSuperstruct,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithSuperstruct',
          request,
          response,
        });

        const controller = new ExternalValidationShowcaseController();
        await templateService.apiHandler({
          methodName: 'validateWithSuperstruct',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsExternalValidationShowcaseController_validateWithIoTs: Record<string, TsoaRoute.ParameterSchema> = {
    payload: {"externalValidator":{"kind":"io-ts","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"WagerSubmission"},
  };

  router.post(
    '/v1/validation/external/ioTs',
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
    ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithIoTs)),
    async function ExternalValidationShowcaseController_validateWithIoTs(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExternalValidationShowcaseController_validateWithIoTs,
          controllerClass: ExternalValidationShowcaseController,
          methodName: 'validateWithIoTs',
          request,
          response,
        });

        const controller = new ExternalValidationShowcaseController();
        await templateService.apiHandler({
          methodName: 'validateWithIoTs',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsCatalogLookupController_getFeaturedCatalog: Record<string, TsoaRoute.ParameterSchema> = {
    audience: {"default":"retail","in":"query","name":"audience","parameterIndex":0,"dataType":"string"},
  };

  router.get(
    '/v1/catalog/featured',
    ...(fetchMiddlewares<RequestHandler>(CatalogLookupController)),
    ...(fetchMiddlewares<RequestHandler>(CatalogLookupController.prototype.getFeaturedCatalog)),
    async function CatalogLookupController_getFeaturedCatalog(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsCatalogLookupController_getFeaturedCatalog,
          controllerClass: CatalogLookupController,
          methodName: 'getFeaturedCatalog',
          request,
          response,
        });

        const controller = new CatalogLookupController();
        await templateService.apiHandler({
          methodName: 'getFeaturedCatalog',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (error) {
        next(error);
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
    ...(fetchMiddlewares<RequestHandler>(CatalogLookupController)),
    ...(fetchMiddlewares<RequestHandler>(CatalogLookupController.prototype.getCatalogItem)),
    async function CatalogLookupController_getCatalogItem(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsCatalogLookupController_getCatalogItem,
          controllerClass: CatalogLookupController,
          methodName: 'getCatalogItem',
          request,
          response,
        });

        const controller = new CatalogLookupController();
        await templateService.apiHandler({
          methodName: 'getCatalogItem',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  const argsExpressMiddlewareShowcaseController_getTrace: Record<string, TsoaRoute.ParameterSchema> = {
  };

  router.get(
    '/v1/middleware/express/trace',
    ...(fetchMiddlewares<RequestHandler>(ExpressMiddlewareShowcaseController)),
    ...(fetchMiddlewares<RequestHandler>(ExpressMiddlewareShowcaseController.prototype.getTrace)),
    async function ExpressMiddlewareShowcaseController_getTrace(request: Request, response: Response, next: NextFunction) {
      try {
        const validatedArgs = templateService.getValidatedArgs({
          args: argsExpressMiddlewareShowcaseController_getTrace,
          controllerClass: ExpressMiddlewareShowcaseController,
          methodName: 'getTrace',
          request,
          response,
        });

        const controller = new ExpressMiddlewareShowcaseController();
        await templateService.apiHandler({
          methodName: 'getTrace',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (error) {
        next(error);
      }
    },
  );
}
