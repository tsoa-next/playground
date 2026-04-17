/* tslint:disable */
/* eslint-disable */
import type { AdditionalProps, Tsoa, TsoaRoute } from 'tsoa-next';
import { fetchMiddlewares, HapiTemplateService } from 'tsoa-next';
import { createEmbeddedSpecGenerator, fetchSpecPaths, normalisePath, resolveSpecPathResponse } from 'tsoa-next';
import { SpecPathShowcaseController } from './../../../controllers/specPathShowcaseController';
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
      "conditionalSpecTargets": {"dataType":"array","array":{"dataType":"string"},"required":true},
      "disabledSpecTargets": {"dataType":"array","array":{"dataType":"string"},"required":true},
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
      "parcels": {"dataType":"double","required":true,"validators":{"minimum":{"value":1}}},
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

const specGenerator = createEmbeddedSpecGenerator({"spec":{"openapi":"3.1.0","components":{"examples":{},"headers":{},"parameters":{},"requestBodies":{},"responses":{},"schemas":{"SpecPathShowcaseStateView":{"properties":{"customCacheGets":{"type":"number","format":"double"},"customCacheSets":{"type":"number","format":"double"},"customStreamCalls":{"type":"number","format":"double"},"customStringCalls":{"type":"number","format":"double"}},"required":["customCacheGets","customCacheSets","customStreamCalls","customStringCalls"],"type":"object","additionalProperties":false},"SpecPathShowcaseStatusView":{"properties":{"availableDocsTargets":{"items":{"type":"string"},"type":"array"},"availableSpecTargets":{"items":{"type":"string"},"type":"array"},"conditionalSpecTargets":{"items":{"type":"string"},"type":"array"},"disabledSpecTargets":{"items":{"type":"string"},"type":"array"},"state":{"$ref":"#/components/schemas/SpecPathShowcaseStateView"}},"required":["availableDocsTargets","availableSpecTargets","conditionalSpecTargets","disabledSpecTargets","state"],"type":"object","additionalProperties":false},"CarrierCode":{"type":"string","enum":["postal-priority","city-bike"]},"ServiceLevelCode":{"type":"string","enum":["standard","expedited"]},"SupportedCurrencyCode":{"type":"string","enum":["USD","EUR"]},"ShippingQuoteView":{"properties":{"quoteId":{"type":"string"},"carrierCode":{"$ref":"#/components/schemas/CarrierCode"},"serviceLevel":{"$ref":"#/components/schemas/ServiceLevelCode"},"destinationLabel":{"type":"string"},"currency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"estimatedBusinessDays":{"type":"number","format":"double"},"quotedAmount":{"type":"number","format":"double"}},"required":["quoteId","carrierCode","serviceLevel","destinationLabel","currency","estimatedBusinessDays","quotedAmount"],"type":"object","additionalProperties":false},"ShippingQuoteRequestQuery":{"properties":{"destinationCountryCode":{"type":"string"},"destinationPostalCode":{"type":"string"},"parcels":{"type":"number","format":"double","minimum":1},"expedited":{"type":"boolean"},"market":{"type":"string","enum":["us","eu"]}},"required":["destinationCountryCode","destinationPostalCode","parcels","expedited","market"],"type":"object","additionalProperties":false},"MoneyAmount":{"properties":{"currency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"amount":{"type":"number","format":"double"}},"required":["currency","amount"],"type":"object","additionalProperties":false},"OrderDraftReceipt":{"properties":{"draftId":{"type":"string"},"customerId":{"type":"string"},"shippingPostalCode":{"type":"string"},"status":{"type":"string","enum":["draft"],"nullable":false},"lineCount":{"type":"number","format":"double"},"subtotal":{"$ref":"#/components/schemas/MoneyAmount"},"notes":{"type":"string"}},"required":["draftId","customerId","shippingPostalCode","status","lineCount","subtotal"],"type":"object","additionalProperties":false},"OrderLineInput":{"properties":{"sku":{"type":"string"},"quantity":{"type":"number","format":"double"},"unitPrice":{"type":"number","format":"double"}},"required":["sku","quantity","unitPrice"],"type":"object","additionalProperties":false},"CreateOrderDraftRequest":{"properties":{"customerId":{"type":"string"},"requestedCurrency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"shippingPostalCode":{"type":"string"},"notes":{"type":"string"},"lines":{"items":{"$ref":"#/components/schemas/OrderLineInput"},"type":"array"}},"required":["customerId","requestedCurrency","shippingPostalCode","lines"],"type":"object","additionalProperties":false},"DraftPricingView":{"properties":{"currency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"subtotal":{"$ref":"#/components/schemas/MoneyAmount"},"tax":{"$ref":"#/components/schemas/MoneyAmount"},"grandTotal":{"$ref":"#/components/schemas/MoneyAmount"}},"required":["currency","subtotal","tax","grandTotal"],"type":"object","additionalProperties":false},"ValidationLifecycleStatus":{"type":"string","enum":["active","disabled"]},"TaggedEntityPayload":{"properties":{"name":{"type":"string"},"status":{"$ref":"#/components/schemas/ValidationLifecycleStatus"},"tags":{"items":{"type":"string"},"type":"array"}},"required":["name","status","tags"],"type":"object","additionalProperties":false},"AuditedTaggedEntityPayload":{"properties":{"name":{"type":"string"},"status":{"$ref":"#/components/schemas/ValidationLifecycleStatus"},"tags":{"items":{"type":"string"},"type":"array"},"auditId":{"type":"number","format":"double"}},"required":["name","status","tags","auditId"],"type":"object","additionalProperties":false},"Branded_number.PositiveFloatBrand_":{"allOf":[{"type":"number","format":"double"}]},"Branded_number.IntBrand_":{"allOf":[{"type":"number","format":"double"}]},"Branded_Branded_number.IntBrand_.PositiveIntegerBrand_":{"allOf":[{"$ref":"#/components/schemas/Branded_number.IntBrand_"}]},"WagerSubmission":{"properties":{"outcome":{"type":"number","format":"double"},"amount":{"type":"number","format":"double"}},"required":["outcome","amount"],"type":"object"},"MarketCode":{"type":"string","enum":["us","eu"]},"CatalogItemView":{"properties":{"sku":{"type":"string"},"title":{"type":"string"},"market":{"$ref":"#/components/schemas/MarketCode"},"warehouse":{"type":"string"},"merchandisingLabel":{"type":"string"},"availableUnits":{"type":"number","format":"double"},"unitPrice":{"$ref":"#/components/schemas/MoneyAmount"}},"required":["sku","title","market","warehouse","merchandisingLabel","availableUnits","unitPrice"],"type":"object","additionalProperties":false},"FeaturedCatalogEnvelope":{"properties":{"audience":{"type":"string"},"generatedAt":{"type":"string","format":"date-time"},"items":{"items":{"$ref":"#/components/schemas/CatalogItemView"},"type":"array"}},"required":["audience","generatedAt","items"],"type":"object","additionalProperties":false},"MiddlewareTraceView":{"properties":{"events":{"items":{"type":"string"},"type":"array"},"framework":{"type":"string"}},"required":["events","framework"],"type":"object","additionalProperties":false}},"securitySchemes":{}},"info":{"title":"tsoa-next Playground API","version":"1.0.0","description":"Reference controllers inspired by tsoa-next upstream fixtures, exposed through Express, Koa, and Hapi.","license":{"name":"MIT"},"contact":{"name":"Vanna DiCatania","email":"vanna@dicatania.me"}},"paths":{"/specPath":{"get":{"operationId":"SpecPathShowcaseController_GetSpecPathStatus","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/SpecPathShowcaseStatusView"}}}}},"description":"Summarizes the available SpecPath targets and the current custom-handler state.","tags":["spec"],"security":[],"parameters":[]}},"/specPath/state":{"get":{"operationId":"SpecPathShowcaseController_GetSpecPathState","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/SpecPathShowcaseStateView"}}}}},"description":"Returns the current custom SpecPath handler/cache counters.","tags":["spec"],"security":[],"parameters":[]}},"/specPath/state/reset":{"post":{"operationId":"SpecPathShowcaseController_ResetState","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/SpecPathShowcaseStateView"}}}}},"description":"Resets the custom SpecPath handler/cache counters so repeatability is easy in tests.","tags":["spec"],"security":[],"parameters":[]}},"/shipping/quote":{"get":{"operationId":"ShippingQuoteController_GetShippingQuote","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ShippingQuoteView"}}}}},"description":"Calculates a delivery quote from grouped query string fields.","tags":["shipping"],"security":[],"parameters":[{"in":"query","name":"destinationCountryCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"destinationPostalCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"parcels","required":true,"schema":{"format":"double","type":"number","minimum":1}},{"in":"query","name":"expedited","required":true,"schema":{"type":"boolean"}},{"in":"query","name":"market","required":true,"schema":{"type":"string","enum":["us","eu"]}}]}},"/shipping/carriers/{carrierCode}/quote":{"get":{"operationId":"ShippingQuoteController_GetCarrierShippingQuote","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ShippingQuoteView"}}}}},"description":"Calculates the same quote while allowing the client to force a specific carrier lane.","tags":["shipping"],"security":[],"parameters":[{"in":"path","name":"carrierCode","required":true,"schema":{"$ref":"#/components/schemas/CarrierCode"}},{"in":"query","name":"destinationCountryCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"destinationPostalCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"parcels","required":true,"schema":{"format":"double","type":"number","minimum":1}},{"in":"query","name":"expedited","required":true,"schema":{"type":"boolean"}},{"in":"query","name":"market","required":true,"schema":{"type":"string","enum":["us","eu"]}}]}},"/order-drafts":{"post":{"operationId":"OrderDraftController_CreateOrderDraft","responses":{"201":{"description":"Draft order staged","content":{"application/json":{"schema":{"$ref":"#/components/schemas/OrderDraftReceipt"}}}}},"description":"Stages a draft order so a client can review the payload before final submission.","tags":["orders"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateOrderDraftRequest"}}}}}},"/order-drafts/{draftId}":{"get":{"operationId":"OrderDraftController_GetOrderDraft","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/OrderDraftReceipt"}}}}},"description":"Retrieves a staged draft order by its identifier.","tags":["orders"],"security":[],"parameters":[{"in":"path","name":"draftId","required":true,"schema":{"type":"string"}}]}},"/order-drafts/pricing":{"post":{"operationId":"OrderDraftController_PriceOrderDraft","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/DraftPricingView"}}}}},"description":"Reprices a draft payload using a caller-selected output currency.","tags":["orders"],"security":[],"parameters":[{"in":"query","name":"currency","required":false,"schema":{"$ref":"#/components/schemas/SupportedCurrencyCode"}}],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateOrderDraftRequest"}}}}}},"/validation/external/zod":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithZod","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/TaggedEntityPayload"}}}}},"description":"Validates a tagged entity payload with Zod.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/TaggedEntityPayload"}],"x-schema-validator":"zod"}}}}}},"/validation/external/joi":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithJoi","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}}}}},"description":"Validates an audited payload with Joi.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}],"x-schema-validator":"joi"}}}}}},"/validation/external/yup":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithYup","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/TaggedEntityPayload"}}}}},"description":"Validates a tagged entity payload with Yup using the object-form configuration.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/TaggedEntityPayload"}],"x-schema-validator":"yup"}}}}}},"/validation/external/superstruct":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithSuperstruct","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}}}}},"description":"Validates an audited payload with Superstruct.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}],"x-schema-validator":"superstruct"}}}}}},"/validation/external/ioTs":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithIoTs","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/WagerSubmission"}}}}},"description":"Validates a wager submission with io-ts branded codecs.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/WagerSubmission"}],"x-schema-validator":"io-ts"}}}}}},"/catalog/featured":{"get":{"operationId":"CatalogLookupController_GetFeaturedCatalog","responses":{"200":{"description":"Featured catalog cards loaded","content":{"application/json":{"schema":{"$ref":"#/components/schemas/FeaturedCatalogEnvelope"},"examples":{"Example 1":{"value":{"audience":"retail","generatedAt":"2026-04-11T15:00:00.000Z","items":[{"availableUnits":42,"market":"us","merchandisingLabel":"new-arrival","sku":"SKU-ALPHA-1","title":"Transit Backpack","unitPrice":{"amount":128,"currency":"USD"},"warehouse":"north-hub"}]}}}}}}},"description":"Returns a curated merchandising strip for a known audience segment.","tags":["catalog"],"security":[],"parameters":[{"in":"query","name":"audience","required":false,"schema":{"default":"retail","type":"string"}}]}},"/catalog/{sku}":{"get":{"operationId":"CatalogLookupController_GetCatalogItem","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/CatalogItemView"}}}}},"description":"Resolves one SKU while allowing the caller to pin market context and warehouse context.","tags":["catalog"],"security":[],"parameters":[{"in":"path","name":"sku","required":true,"schema":{"type":"string"}},{"in":"header","name":"x-market","required":false,"schema":{"$ref":"#/components/schemas/MarketCode"}},{"in":"query","name":"warehouse","required":false,"schema":{"type":"string"}}]}},"/middleware/hapi/trace":{"get":{"operationId":"HapiMiddlewareShowcaseController_GetTrace","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/MiddlewareTraceView"}}}}},"description":"Runs controller-level and method-level Hapi pre-handlers before returning the trace.","tags":["middleware"],"security":[],"parameters":[]}}},"servers":[{"url":"http://127.0.0.1:3103/v1"}]},"yaml":"openapi: 3.1.0\ncomponents:\n  examples: {}\n  headers: {}\n  parameters: {}\n  requestBodies: {}\n  responses: {}\n  schemas:\n    SpecPathShowcaseStateView:\n      properties:\n        customCacheGets:\n          type: number\n          format: double\n        customCacheSets:\n          type: number\n          format: double\n        customStreamCalls:\n          type: number\n          format: double\n        customStringCalls:\n          type: number\n          format: double\n      required:\n        - customCacheGets\n        - customCacheSets\n        - customStreamCalls\n        - customStringCalls\n      type: object\n      additionalProperties: false\n    SpecPathShowcaseStatusView:\n      properties:\n        availableDocsTargets:\n          items:\n            type: string\n          type: array\n        availableSpecTargets:\n          items:\n            type: string\n          type: array\n        conditionalSpecTargets:\n          items:\n            type: string\n          type: array\n        disabledSpecTargets:\n          items:\n            type: string\n          type: array\n        state:\n          $ref: \"#/components/schemas/SpecPathShowcaseStateView\"\n      required:\n        - availableDocsTargets\n        - availableSpecTargets\n        - conditionalSpecTargets\n        - disabledSpecTargets\n        - state\n      type: object\n      additionalProperties: false\n    CarrierCode:\n      type: string\n      enum:\n        - postal-priority\n        - city-bike\n    ServiceLevelCode:\n      type: string\n      enum:\n        - standard\n        - expedited\n    SupportedCurrencyCode:\n      type: string\n      enum:\n        - USD\n        - EUR\n    ShippingQuoteView:\n      properties:\n        quoteId:\n          type: string\n        carrierCode:\n          $ref: \"#/components/schemas/CarrierCode\"\n        serviceLevel:\n          $ref: \"#/components/schemas/ServiceLevelCode\"\n        destinationLabel:\n          type: string\n        currency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        estimatedBusinessDays:\n          type: number\n          format: double\n        quotedAmount:\n          type: number\n          format: double\n      required:\n        - quoteId\n        - carrierCode\n        - serviceLevel\n        - destinationLabel\n        - currency\n        - estimatedBusinessDays\n        - quotedAmount\n      type: object\n      additionalProperties: false\n    ShippingQuoteRequestQuery:\n      properties:\n        destinationCountryCode:\n          type: string\n        destinationPostalCode:\n          type: string\n        parcels:\n          type: number\n          format: double\n          minimum: 1\n        expedited:\n          type: boolean\n        market:\n          type: string\n          enum:\n            - us\n            - eu\n      required:\n        - destinationCountryCode\n        - destinationPostalCode\n        - parcels\n        - expedited\n        - market\n      type: object\n      additionalProperties: false\n    MoneyAmount:\n      properties:\n        currency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        amount:\n          type: number\n          format: double\n      required:\n        - currency\n        - amount\n      type: object\n      additionalProperties: false\n    OrderDraftReceipt:\n      properties:\n        draftId:\n          type: string\n        customerId:\n          type: string\n        shippingPostalCode:\n          type: string\n        status:\n          type: string\n          enum:\n            - draft\n          nullable: false\n        lineCount:\n          type: number\n          format: double\n        subtotal:\n          $ref: \"#/components/schemas/MoneyAmount\"\n        notes:\n          type: string\n      required:\n        - draftId\n        - customerId\n        - shippingPostalCode\n        - status\n        - lineCount\n        - subtotal\n      type: object\n      additionalProperties: false\n    OrderLineInput:\n      properties:\n        sku:\n          type: string\n        quantity:\n          type: number\n          format: double\n        unitPrice:\n          type: number\n          format: double\n      required:\n        - sku\n        - quantity\n        - unitPrice\n      type: object\n      additionalProperties: false\n    CreateOrderDraftRequest:\n      properties:\n        customerId:\n          type: string\n        requestedCurrency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        shippingPostalCode:\n          type: string\n        notes:\n          type: string\n        lines:\n          items:\n            $ref: \"#/components/schemas/OrderLineInput\"\n          type: array\n      required:\n        - customerId\n        - requestedCurrency\n        - shippingPostalCode\n        - lines\n      type: object\n      additionalProperties: false\n    DraftPricingView:\n      properties:\n        currency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        subtotal:\n          $ref: \"#/components/schemas/MoneyAmount\"\n        tax:\n          $ref: \"#/components/schemas/MoneyAmount\"\n        grandTotal:\n          $ref: \"#/components/schemas/MoneyAmount\"\n      required:\n        - currency\n        - subtotal\n        - tax\n        - grandTotal\n      type: object\n      additionalProperties: false\n    ValidationLifecycleStatus:\n      type: string\n      enum:\n        - active\n        - disabled\n    TaggedEntityPayload:\n      properties:\n        name:\n          type: string\n        status:\n          $ref: \"#/components/schemas/ValidationLifecycleStatus\"\n        tags:\n          items:\n            type: string\n          type: array\n      required:\n        - name\n        - status\n        - tags\n      type: object\n      additionalProperties: false\n    AuditedTaggedEntityPayload:\n      properties:\n        name:\n          type: string\n        status:\n          $ref: \"#/components/schemas/ValidationLifecycleStatus\"\n        tags:\n          items:\n            type: string\n          type: array\n        auditId:\n          type: number\n          format: double\n      required:\n        - name\n        - status\n        - tags\n        - auditId\n      type: object\n      additionalProperties: false\n    Branded_number.PositiveFloatBrand_:\n      allOf:\n        - type: number\n          format: double\n    Branded_number.IntBrand_:\n      allOf:\n        - type: number\n          format: double\n    Branded_Branded_number.IntBrand_.PositiveIntegerBrand_:\n      allOf:\n        - $ref: \"#/components/schemas/Branded_number.IntBrand_\"\n    WagerSubmission:\n      properties:\n        outcome:\n          type: number\n          format: double\n        amount:\n          type: number\n          format: double\n      required:\n        - outcome\n        - amount\n      type: object\n    MarketCode:\n      type: string\n      enum:\n        - us\n        - eu\n    CatalogItemView:\n      properties:\n        sku:\n          type: string\n        title:\n          type: string\n        market:\n          $ref: \"#/components/schemas/MarketCode\"\n        warehouse:\n          type: string\n        merchandisingLabel:\n          type: string\n        availableUnits:\n          type: number\n          format: double\n        unitPrice:\n          $ref: \"#/components/schemas/MoneyAmount\"\n      required:\n        - sku\n        - title\n        - market\n        - warehouse\n        - merchandisingLabel\n        - availableUnits\n        - unitPrice\n      type: object\n      additionalProperties: false\n    FeaturedCatalogEnvelope:\n      properties:\n        audience:\n          type: string\n        generatedAt:\n          type: string\n          format: date-time\n        items:\n          items:\n            $ref: \"#/components/schemas/CatalogItemView\"\n          type: array\n      required:\n        - audience\n        - generatedAt\n        - items\n      type: object\n      additionalProperties: false\n    MiddlewareTraceView:\n      properties:\n        events:\n          items:\n            type: string\n          type: array\n        framework:\n          type: string\n      required:\n        - events\n        - framework\n      type: object\n      additionalProperties: false\n  securitySchemes: {}\ninfo:\n  title: tsoa-next Playground API\n  version: 1.0.0\n  description: Reference controllers inspired by tsoa-next upstream fixtures,\n    exposed through Express, Koa, and Hapi.\n  license:\n    name: MIT\n  contact:\n    name: Vanna DiCatania\n    email: vanna@dicatania.me\npaths:\n  /specPath:\n    get:\n      operationId: SpecPathShowcaseController_GetSpecPathStatus\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/SpecPathShowcaseStatusView\"\n      description: Summarizes the available SpecPath targets and the current\n        custom-handler state.\n      tags:\n        - spec\n      security: []\n      parameters: []\n  /specPath/state:\n    get:\n      operationId: SpecPathShowcaseController_GetSpecPathState\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/SpecPathShowcaseStateView\"\n      description: Returns the current custom SpecPath handler/cache counters.\n      tags:\n        - spec\n      security: []\n      parameters: []\n  /specPath/state/reset:\n    post:\n      operationId: SpecPathShowcaseController_ResetState\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/SpecPathShowcaseStateView\"\n      description: Resets the custom SpecPath handler/cache counters so repeatability\n        is easy in tests.\n      tags:\n        - spec\n      security: []\n      parameters: []\n  /shipping/quote:\n    get:\n      operationId: ShippingQuoteController_GetShippingQuote\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/ShippingQuoteView\"\n      description: Calculates a delivery quote from grouped query string fields.\n      tags:\n        - shipping\n      security: []\n      parameters:\n        - in: query\n          name: destinationCountryCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: destinationPostalCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: parcels\n          required: true\n          schema:\n            format: double\n            type: number\n            minimum: 1\n        - in: query\n          name: expedited\n          required: true\n          schema:\n            type: boolean\n        - in: query\n          name: market\n          required: true\n          schema:\n            type: string\n            enum:\n              - us\n              - eu\n  /shipping/carriers/{carrierCode}/quote:\n    get:\n      operationId: ShippingQuoteController_GetCarrierShippingQuote\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/ShippingQuoteView\"\n      description: Calculates the same quote while allowing the client to force a\n        specific carrier lane.\n      tags:\n        - shipping\n      security: []\n      parameters:\n        - in: path\n          name: carrierCode\n          required: true\n          schema:\n            $ref: \"#/components/schemas/CarrierCode\"\n        - in: query\n          name: destinationCountryCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: destinationPostalCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: parcels\n          required: true\n          schema:\n            format: double\n            type: number\n            minimum: 1\n        - in: query\n          name: expedited\n          required: true\n          schema:\n            type: boolean\n        - in: query\n          name: market\n          required: true\n          schema:\n            type: string\n            enum:\n              - us\n              - eu\n  /order-drafts:\n    post:\n      operationId: OrderDraftController_CreateOrderDraft\n      responses:\n        \"201\":\n          description: Draft order staged\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/OrderDraftReceipt\"\n      description: Stages a draft order so a client can review the payload before\n        final submission.\n      tags:\n        - orders\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: \"#/components/schemas/CreateOrderDraftRequest\"\n  /order-drafts/{draftId}:\n    get:\n      operationId: OrderDraftController_GetOrderDraft\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/OrderDraftReceipt\"\n      description: Retrieves a staged draft order by its identifier.\n      tags:\n        - orders\n      security: []\n      parameters:\n        - in: path\n          name: draftId\n          required: true\n          schema:\n            type: string\n  /order-drafts/pricing:\n    post:\n      operationId: OrderDraftController_PriceOrderDraft\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/DraftPricingView\"\n      description: Reprices a draft payload using a caller-selected output currency.\n      tags:\n        - orders\n      security: []\n      parameters:\n        - in: query\n          name: currency\n          required: false\n          schema:\n            $ref: \"#/components/schemas/SupportedCurrencyCode\"\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: \"#/components/schemas/CreateOrderDraftRequest\"\n  /validation/external/zod:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithZod\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/TaggedEntityPayload\"\n      description: Validates a tagged entity payload with Zod.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/TaggedEntityPayload\"\n              x-schema-validator: zod\n  /validation/external/joi:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithJoi\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n      description: Validates an audited payload with Joi.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n              x-schema-validator: joi\n  /validation/external/yup:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithYup\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/TaggedEntityPayload\"\n      description: Validates a tagged entity payload with Yup using the object-form\n        configuration.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/TaggedEntityPayload\"\n              x-schema-validator: yup\n  /validation/external/superstruct:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithSuperstruct\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n      description: Validates an audited payload with Superstruct.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n              x-schema-validator: superstruct\n  /validation/external/ioTs:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithIoTs\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/WagerSubmission\"\n      description: Validates a wager submission with io-ts branded codecs.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/WagerSubmission\"\n              x-schema-validator: io-ts\n  /catalog/featured:\n    get:\n      operationId: CatalogLookupController_GetFeaturedCatalog\n      responses:\n        \"200\":\n          description: Featured catalog cards loaded\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/FeaturedCatalogEnvelope\"\n              examples:\n                Example 1:\n                  value:\n                    audience: retail\n                    generatedAt: 2026-04-11T15:00:00.000Z\n                    items:\n                      - availableUnits: 42\n                        market: us\n                        merchandisingLabel: new-arrival\n                        sku: SKU-ALPHA-1\n                        title: Transit Backpack\n                        unitPrice:\n                          amount: 128\n                          currency: USD\n                        warehouse: north-hub\n      description: Returns a curated merchandising strip for a known audience segment.\n      tags:\n        - catalog\n      security: []\n      parameters:\n        - in: query\n          name: audience\n          required: false\n          schema:\n            default: retail\n            type: string\n  /catalog/{sku}:\n    get:\n      operationId: CatalogLookupController_GetCatalogItem\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/CatalogItemView\"\n      description: Resolves one SKU while allowing the caller to pin market context\n        and warehouse context.\n      tags:\n        - catalog\n      security: []\n      parameters:\n        - in: path\n          name: sku\n          required: true\n          schema:\n            type: string\n        - in: header\n          name: x-market\n          required: false\n          schema:\n            $ref: \"#/components/schemas/MarketCode\"\n        - in: query\n          name: warehouse\n          required: false\n          schema:\n            type: string\n  /middleware/hapi/trace:\n    get:\n      operationId: HapiMiddlewareShowcaseController_GetTrace\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/MiddlewareTraceView\"\n      description: Runs controller-level and method-level Hapi pre-handlers before\n        returning the trace.\n      tags:\n        - middleware\n      security: []\n      parameters: []\nservers:\n  - url: http://127.0.0.1:3103/v1\n"} as Parameters<typeof createEmbeddedSpecGenerator>[0]);

export function RegisterRoutes(server: Server, opts?: { validation?: Tsoa.ValidationContext }) {
  const additionalProps: AdditionalProps = {
    ...{"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true},
    validation: opts?.validation,
  };
  const templateService = new HapiTemplateService(models, additionalProps, { boomify, isBoom });
  const registeredGetPaths = new Set<string>(["/v1/specPath","/v1/specPath/state","/v1/shipping/quote","/v1/shipping/carriers/{carrierCode}/quote","/v1/order-drafts/{draftId}","/v1/catalog/featured","/v1/catalog/{sku}","/v1/middleware/hapi/trace"]);
  for (const specPath of fetchSpecPaths(SpecPathShowcaseController)) {
    if (specPath.gate === false) {
      continue;
    }

    const specFullPath = normalisePath('/v1/specPath' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for SpecPathShowcaseController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    server.route({
      method: 'get',
      path: specFullPath,
      options: {
        handler: async function SpecPathShowcaseController_specPath(request: Request, h: ResponseToolkit) {
          try {
            const specResponse = await resolveSpecPathResponse({
              controllerClass: SpecPathShowcaseController,
              fullPath: specFullPath,
              request,
              response: h,
              runtime: 'hapi',
              specGenerator,
              specPath,
            });

            const response = h.response(specResponse.body).code(200);
            if (specResponse.contentType) {
              response.type(specResponse.contentType);
            }

            return response;
          } catch (error) {
            throw toBoomError(error);
          }
        },
      },
    });
  }
  for (const specPath of fetchSpecPaths(ShippingQuoteController)) {
    if (specPath.gate === false) {
      continue;
    }

    const specFullPath = normalisePath('/v1/shipping' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for ShippingQuoteController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    server.route({
      method: 'get',
      path: specFullPath,
      options: {
        handler: async function ShippingQuoteController_specPath(request: Request, h: ResponseToolkit) {
          try {
            const specResponse = await resolveSpecPathResponse({
              controllerClass: ShippingQuoteController,
              fullPath: specFullPath,
              request,
              response: h,
              runtime: 'hapi',
              specGenerator,
              specPath,
            });

            const response = h.response(specResponse.body).code(200);
            if (specResponse.contentType) {
              response.type(specResponse.contentType);
            }

            return response;
          } catch (error) {
            throw toBoomError(error);
          }
        },
      },
    });
  }
  for (const specPath of fetchSpecPaths(OrderDraftController)) {
    if (specPath.gate === false) {
      continue;
    }

    const specFullPath = normalisePath('/v1/order-drafts' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for OrderDraftController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    server.route({
      method: 'get',
      path: specFullPath,
      options: {
        handler: async function OrderDraftController_specPath(request: Request, h: ResponseToolkit) {
          try {
            const specResponse = await resolveSpecPathResponse({
              controllerClass: OrderDraftController,
              fullPath: specFullPath,
              request,
              response: h,
              runtime: 'hapi',
              specGenerator,
              specPath,
            });

            const response = h.response(specResponse.body).code(200);
            if (specResponse.contentType) {
              response.type(specResponse.contentType);
            }

            return response;
          } catch (error) {
            throw toBoomError(error);
          }
        },
      },
    });
  }
  for (const specPath of fetchSpecPaths(ExternalValidationShowcaseController)) {
    if (specPath.gate === false) {
      continue;
    }

    const specFullPath = normalisePath('/v1/validation/external' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for ExternalValidationShowcaseController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    server.route({
      method: 'get',
      path: specFullPath,
      options: {
        handler: async function ExternalValidationShowcaseController_specPath(request: Request, h: ResponseToolkit) {
          try {
            const specResponse = await resolveSpecPathResponse({
              controllerClass: ExternalValidationShowcaseController,
              fullPath: specFullPath,
              request,
              response: h,
              runtime: 'hapi',
              specGenerator,
              specPath,
            });

            const response = h.response(specResponse.body).code(200);
            if (specResponse.contentType) {
              response.type(specResponse.contentType);
            }

            return response;
          } catch (error) {
            throw toBoomError(error);
          }
        },
      },
    });
  }
  for (const specPath of fetchSpecPaths(CatalogLookupController)) {
    if (specPath.gate === false) {
      continue;
    }

    const specFullPath = normalisePath('/v1/catalog' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for CatalogLookupController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    server.route({
      method: 'get',
      path: specFullPath,
      options: {
        handler: async function CatalogLookupController_specPath(request: Request, h: ResponseToolkit) {
          try {
            const specResponse = await resolveSpecPathResponse({
              controllerClass: CatalogLookupController,
              fullPath: specFullPath,
              request,
              response: h,
              runtime: 'hapi',
              specGenerator,
              specPath,
            });

            const response = h.response(specResponse.body).code(200);
            if (specResponse.contentType) {
              response.type(specResponse.contentType);
            }

            return response;
          } catch (error) {
            throw toBoomError(error);
          }
        },
      },
    });
  }
  for (const specPath of fetchSpecPaths(HapiMiddlewareShowcaseController)) {
    if (specPath.gate === false) {
      continue;
    }

    const specFullPath = normalisePath('/v1/middleware/hapi' + specPath.normalizedPath, '/', '', false);
    if (registeredGetPaths.has(specFullPath)) {
      throw new Error(`Duplicate GET route detected while registering @SpecPath for HapiMiddlewareShowcaseController at '${specFullPath}'.`);
    }
    registeredGetPaths.add(specFullPath);

    server.route({
      method: 'get',
      path: specFullPath,
      options: {
        handler: async function HapiMiddlewareShowcaseController_specPath(request: Request, h: ResponseToolkit) {
          try {
            const specResponse = await resolveSpecPathResponse({
              controllerClass: HapiMiddlewareShowcaseController,
              fullPath: specFullPath,
              request,
              response: h,
              runtime: 'hapi',
              specGenerator,
              specPath,
            });

            const response = h.response(specResponse.body).code(200);
            if (specResponse.contentType) {
              response.type(specResponse.contentType);
            }

            return response;
          } catch (error) {
            throw toBoomError(error);
          }
        },
      },
    });
  }

  const argsSpecPathShowcaseController_getSpecPathStatus: Record<string, TsoaRoute.ParameterSchema> = {
  };

  server.route({
    method: 'get',
    path: '/v1/specPath',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(SpecPathShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(SpecPathShowcaseController.prototype.getSpecPathStatus)),
      ],
      handler: async function SpecPathShowcaseController_getSpecPathStatus(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsSpecPathShowcaseController_getSpecPathStatus,
            controllerClass: SpecPathShowcaseController,
            methodName: 'getSpecPathStatus',
            request,
            h,
          });

          const controller = new SpecPathShowcaseController();
          return templateService.apiHandler({
            methodName: 'getSpecPathStatus',
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

  const argsSpecPathShowcaseController_getSpecPathState: Record<string, TsoaRoute.ParameterSchema> = {
  };

  server.route({
    method: 'get',
    path: '/v1/specPath/state',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(SpecPathShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(SpecPathShowcaseController.prototype.getSpecPathState)),
      ],
      handler: async function SpecPathShowcaseController_getSpecPathState(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsSpecPathShowcaseController_getSpecPathState,
            controllerClass: SpecPathShowcaseController,
            methodName: 'getSpecPathState',
            request,
            h,
          });

          const controller = new SpecPathShowcaseController();
          return templateService.apiHandler({
            methodName: 'getSpecPathState',
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

  const argsSpecPathShowcaseController_resetState: Record<string, TsoaRoute.ParameterSchema> = {
  };

  server.route({
    method: 'post',
    path: '/v1/specPath/state/reset',
    options: {
      pre: [
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(SpecPathShowcaseController)),
        ...(fetchMiddlewares<RouteOptionsPreAllOptions>(SpecPathShowcaseController.prototype.resetState)),
      ],
      handler: async function SpecPathShowcaseController_resetState(request: Request, h: ResponseToolkit) {
        try {
          const validatedArgs = templateService.getValidatedArgs({
            args: argsSpecPathShowcaseController_resetState,
            controllerClass: SpecPathShowcaseController,
            methodName: 'resetState',
            request,
            h,
          });

          const controller = new SpecPathShowcaseController();
          return templateService.apiHandler({
            methodName: 'resetState',
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
