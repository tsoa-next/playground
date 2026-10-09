/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/tsoa-next/tsoa-next
import type { AdditionalProps, Tsoa, TsoaRoute } from 'tsoa-next';
import { fetchMiddlewares, ExpressTemplateService } from 'tsoa-next';
import { createEmbeddedSpecGenerator, fetchSpecPaths, normalisePath, resolveSpecPathResponse } from 'tsoa-next';
import { pipeline } from 'node:stream';
import { UploadShowcaseController } from './../../../controllers/uploadShowcaseController';
import { SpecPathShowcaseController } from './../../../controllers/specPathShowcaseController';
import { ShippingQuoteController } from './../../../controllers/shippingQuoteController';
import { SecurityShowcaseController } from './../../../controllers/securityShowcaseController';
import { OrderDraftController } from './../../../controllers/orderDraftController';
import { FeatureShowcaseController } from './../../../controllers/featureShowcaseController';
import { ExternalValidationShowcaseController } from './../../../controllers/externalValidationShowcaseController';
import { CatalogLookupController } from './../../../controllers/catalogLookupController';
import { ExpressMiddlewareShowcaseController } from './../../../controllers/express/expressMiddlewareShowcaseController';
import { ExpressHeadShowcaseController } from './../../../controllers/express/expressHeadShowcaseController';
import { expressAuthentication } from './../../../lib/authentication';
// @ts-ignore - no great way to install types from subpackage
import { iocContainer } from './../../../lib/ioc';
import type { IocContainer, IocContainerFactory } from 'tsoa-next';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const multer = require('multer');
const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;
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
    "PlaygroundUser": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "scheme": {"dataType":"string","required":true},
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
    "GreetingView": {
        "dataType": "refObject",
        "properties": {
            "greeting": {"dataType":"string","required":true},
            "requestId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    "GreetingInput": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
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
const specGenerator = createEmbeddedSpecGenerator({"spec":{"openapi":"3.1.0","components":{"examples":{},"headers":{},"parameters":{},"requestBodies":{},"responses":{},"schemas":{"SpecPathShowcaseStateView":{"properties":{"customCacheGets":{"type":"number","format":"double"},"customCacheSets":{"type":"number","format":"double"},"customStreamCalls":{"type":"number","format":"double"},"customStringCalls":{"type":"number","format":"double"}},"required":["customCacheGets","customCacheSets","customStreamCalls","customStringCalls"],"type":"object","additionalProperties":false},"SpecPathShowcaseStatusView":{"properties":{"availableDocsTargets":{"items":{"type":"string"},"type":"array"},"availableSpecTargets":{"items":{"type":"string"},"type":"array"},"conditionalSpecTargets":{"items":{"type":"string"},"type":"array"},"disabledSpecTargets":{"items":{"type":"string"},"type":"array"},"state":{"$ref":"#/components/schemas/SpecPathShowcaseStateView"}},"required":["availableDocsTargets","availableSpecTargets","conditionalSpecTargets","disabledSpecTargets","state"],"type":"object","additionalProperties":false},"CarrierCode":{"type":"string","enum":["postal-priority","city-bike"]},"ServiceLevelCode":{"type":"string","enum":["standard","expedited"]},"SupportedCurrencyCode":{"type":"string","enum":["USD","EUR"]},"ShippingQuoteView":{"properties":{"quoteId":{"type":"string"},"carrierCode":{"$ref":"#/components/schemas/CarrierCode"},"serviceLevel":{"$ref":"#/components/schemas/ServiceLevelCode"},"destinationLabel":{"type":"string"},"currency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"estimatedBusinessDays":{"type":"number","format":"double"},"quotedAmount":{"type":"number","format":"double"}},"required":["quoteId","carrierCode","serviceLevel","destinationLabel","currency","estimatedBusinessDays","quotedAmount"],"type":"object","additionalProperties":false},"ShippingQuoteRequestQuery":{"properties":{"destinationCountryCode":{"type":"string"},"destinationPostalCode":{"type":"string"},"parcels":{"type":"number","format":"double","minimum":1},"expedited":{"type":"boolean"},"market":{"type":"string","enum":["us","eu"]}},"required":["destinationCountryCode","destinationPostalCode","parcels","expedited","market"],"type":"object","additionalProperties":false},"PlaygroundUser":{"properties":{"name":{"type":"string"},"scheme":{"type":"string"}},"required":["name","scheme"],"type":"object","additionalProperties":false},"MoneyAmount":{"properties":{"currency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"amount":{"type":"number","format":"double"}},"required":["currency","amount"],"type":"object","additionalProperties":false},"OrderDraftReceipt":{"properties":{"draftId":{"type":"string"},"customerId":{"type":"string"},"shippingPostalCode":{"type":"string"},"status":{"type":"string","enum":["draft"],"nullable":false},"lineCount":{"type":"number","format":"double"},"subtotal":{"$ref":"#/components/schemas/MoneyAmount"},"notes":{"type":"string"}},"required":["draftId","customerId","shippingPostalCode","status","lineCount","subtotal"],"type":"object","additionalProperties":false},"OrderLineInput":{"properties":{"sku":{"type":"string"},"quantity":{"type":"number","format":"double"},"unitPrice":{"type":"number","format":"double"}},"required":["sku","quantity","unitPrice"],"type":"object","additionalProperties":false},"CreateOrderDraftRequest":{"properties":{"customerId":{"type":"string"},"requestedCurrency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"shippingPostalCode":{"type":"string"},"notes":{"type":"string"},"lines":{"items":{"$ref":"#/components/schemas/OrderLineInput"},"type":"array"}},"required":["customerId","requestedCurrency","shippingPostalCode","lines"],"type":"object","additionalProperties":false},"DraftPricingView":{"properties":{"currency":{"$ref":"#/components/schemas/SupportedCurrencyCode"},"subtotal":{"$ref":"#/components/schemas/MoneyAmount"},"tax":{"$ref":"#/components/schemas/MoneyAmount"},"grandTotal":{"$ref":"#/components/schemas/MoneyAmount"}},"required":["currency","subtotal","tax","grandTotal"],"type":"object","additionalProperties":false},"GreetingView":{"properties":{"greeting":{"type":"string"},"requestId":{"type":"string"}},"required":["greeting","requestId"],"type":"object","additionalProperties":false},"GreetingInput":{"properties":{"name":{"type":"string"}},"required":["name"],"type":"object","additionalProperties":false},"ValidationLifecycleStatus":{"type":"string","enum":["active","disabled"]},"TaggedEntityPayload":{"properties":{"name":{"type":"string"},"status":{"$ref":"#/components/schemas/ValidationLifecycleStatus"},"tags":{"items":{"type":"string"},"type":"array"}},"required":["name","status","tags"],"type":"object","additionalProperties":false},"AuditedTaggedEntityPayload":{"properties":{"name":{"type":"string"},"status":{"$ref":"#/components/schemas/ValidationLifecycleStatus"},"tags":{"items":{"type":"string"},"type":"array"},"auditId":{"type":"number","format":"double"}},"required":["name","status","tags","auditId"],"type":"object","additionalProperties":false},"Branded_number.PositiveFloatBrand_":{"allOf":[{"type":"number","format":"double"}]},"Branded_number.IntBrand_":{"allOf":[{"type":"number","format":"double"}]},"Branded_Branded_number.IntBrand_.PositiveIntegerBrand_":{"allOf":[{"$ref":"#/components/schemas/Branded_number.IntBrand_"}]},"WagerSubmission":{"properties":{"outcome":{"type":"number","format":"double"},"amount":{"type":"number","format":"double"}},"required":["outcome","amount"],"type":"object"},"MarketCode":{"type":"string","enum":["us","eu"]},"CatalogItemView":{"properties":{"sku":{"type":"string"},"title":{"type":"string"},"market":{"$ref":"#/components/schemas/MarketCode"},"warehouse":{"type":"string"},"merchandisingLabel":{"type":"string"},"availableUnits":{"type":"number","format":"double"},"unitPrice":{"$ref":"#/components/schemas/MoneyAmount"}},"required":["sku","title","market","warehouse","merchandisingLabel","availableUnits","unitPrice"],"type":"object","additionalProperties":false},"FeaturedCatalogEnvelope":{"properties":{"audience":{"type":"string"},"generatedAt":{"type":"string","format":"date-time"},"items":{"items":{"$ref":"#/components/schemas/CatalogItemView"},"type":"array"}},"required":["audience","generatedAt","items"],"type":"object","additionalProperties":false},"MiddlewareTraceView":{"properties":{"events":{"items":{"type":"string"},"type":"array"},"framework":{"type":"string"}},"required":["events","framework"],"type":"object","additionalProperties":false}},"securitySchemes":{"api_key":{"type":"apiKey","name":"x-api-key","in":"header"},"bearer":{"type":"oauth2","flows":{"implicit":{"authorizationUrl":"https://example.invalid/authorize","scopes":{"read":"Read demo data","write":"Write demo data"}}}}}},"info":{"title":"tsoa-next Playground API","version":"1.0.0","description":"Reference controllers inspired by tsoa-next upstream fixtures, exposed through Express, Koa, and Hapi.","license":{"name":"MIT"},"contact":{"name":"Vanna DiCatania","email":"vanna@dicatania.me"}},"paths":{"/uploads/single":{"post":{"operationId":"UploadShowcaseController_Single","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"content":{"type":"string"},"bytes":{"type":"number","format":"double"},"name":{"type":"string"},"title":{"type":"string"}},"required":["content","bytes","name","title"],"type":"object"}}}}},"tags":["uploads"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"multipart/form-data":{"schema":{"type":"object","properties":{"title":{"type":"string"},"asset":{"type":"string","format":"binary"}},"required":["title","asset"]}}}}}},"/uploads/many":{"post":{"operationId":"UploadShowcaseController_Many","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"contents":{"items":{"type":"string"},"type":"array"},"names":{"items":{"type":"string"},"type":"array"}},"required":["contents","names"],"type":"object"}}}}},"tags":["uploads"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"multipart/form-data":{"schema":{"type":"object","properties":{"assets":{"items":{"type":"string","format":"binary"},"type":"array"}},"required":["assets"]}}}}}},"/specPath":{"get":{"operationId":"SpecPathShowcaseController_GetSpecPathStatus","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/SpecPathShowcaseStatusView"}}}}},"description":"Summarizes the available SpecPath targets and the current custom-handler state.","tags":["spec"],"security":[],"parameters":[]}},"/specPath/state":{"get":{"operationId":"SpecPathShowcaseController_GetSpecPathState","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/SpecPathShowcaseStateView"}}}}},"description":"Returns the current custom SpecPath handler/cache counters.","tags":["spec"],"security":[],"parameters":[]}},"/specPath/state/reset":{"post":{"operationId":"SpecPathShowcaseController_ResetState","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/SpecPathShowcaseStateView"}}}}},"description":"Resets the custom SpecPath handler/cache counters so repeatability is easy in tests.","tags":["spec"],"security":[],"parameters":[]}},"/shipping/quote":{"get":{"operationId":"ShippingQuoteController_GetShippingQuote","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ShippingQuoteView"}}}}},"description":"Calculates a delivery quote from grouped query string fields.","tags":["shipping"],"security":[],"parameters":[{"in":"query","name":"destinationCountryCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"destinationPostalCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"parcels","required":true,"schema":{"format":"double","type":"number","minimum":1}},{"in":"query","name":"expedited","required":true,"schema":{"type":"boolean"}},{"in":"query","name":"market","required":true,"schema":{"type":"string","enum":["us","eu"]}}]}},"/shipping/carriers/{carrierCode}/quote":{"get":{"operationId":"ShippingQuoteController_GetCarrierShippingQuote","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ShippingQuoteView"}}}}},"description":"Calculates the same quote while allowing the client to force a specific carrier lane.","tags":["shipping"],"security":[],"parameters":[{"in":"path","name":"carrierCode","required":true,"schema":{"$ref":"#/components/schemas/CarrierCode"}},{"in":"query","name":"destinationCountryCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"destinationPostalCode","required":true,"schema":{"type":"string"}},{"in":"query","name":"parcels","required":true,"schema":{"format":"double","type":"number","minimum":1}},{"in":"query","name":"expedited","required":true,"schema":{"type":"boolean"}},{"in":"query","name":"market","required":true,"schema":{"type":"string","enum":["us","eu"]}}]}},"/security/root":{"get":{"operationId":"SecurityShowcaseController_Root","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"user":{"$ref":"#/components/schemas/PlaygroundUser"}},"type":"object"}}}}},"tags":["security"],"security":[{"api_key":[]}],"parameters":[]}},"/security/public":{"get":{"operationId":"SecurityShowcaseController_Public","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"public":{"type":"boolean"}},"required":["public"],"type":"object"}}}}},"tags":["security"],"security":[],"parameters":[]}},"/security/either":{"get":{"operationId":"SecurityShowcaseController_Either","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"authorized":{"type":"boolean"}},"required":["authorized"],"type":"object"}}}}},"tags":["security"],"security":[{"api_key":[]},{"bearer":["read"]}],"parameters":[]}},"/security/both":{"get":{"operationId":"SecurityShowcaseController_Both","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"authorized":{"type":"boolean"}},"required":["authorized"],"type":"object"}}}}},"tags":["security"],"security":[{"api_key":[],"bearer":["read"]}],"parameters":[]}},"/security/scoped":{"get":{"operationId":"SecurityShowcaseController_Scoped","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"authorized":{"type":"boolean"}},"required":["authorized"],"type":"object"}}}}},"tags":["security"],"security":[{"bearer":["write"]}],"parameters":[]}},"/order-drafts":{"post":{"operationId":"OrderDraftController_CreateOrderDraft","responses":{"201":{"description":"Draft order staged","content":{"application/json":{"schema":{"$ref":"#/components/schemas/OrderDraftReceipt"}}}}},"description":"Stages a draft order so a client can review the payload before final submission.","tags":["orders"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateOrderDraftRequest"}}}}}},"/order-drafts/{draftId}":{"get":{"operationId":"OrderDraftController_GetOrderDraft","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/OrderDraftReceipt"}}}}},"description":"Retrieves a staged draft order by its identifier.","tags":["orders"],"security":[],"parameters":[{"in":"path","name":"draftId","required":true,"schema":{"type":"string"}}]}},"/order-drafts/pricing":{"post":{"operationId":"OrderDraftController_PriceOrderDraft","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/DraftPricingView"}}}}},"description":"Reprices a draft payload using a caller-selected output currency.","tags":["orders"],"security":[],"parameters":[{"in":"query","name":"currency","required":false,"schema":{"$ref":"#/components/schemas/SupportedCurrencyCode"}}],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateOrderDraftRequest"}}}}}},"/features/greeting":{"post":{"operationId":"createGreeting","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/GreetingView"},"examples":{"Example 1":{"value":{"greeting":"Hello Ada","requestId":"demo"}}}}}}},"tags":["features"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/GreetingInput"}}}}}},"/features/body-property":{"post":{"operationId":"FeatureShowcaseController_BodyProperty","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"name":{"type":"string"}},"required":["name"],"type":"object"}}}}},"tags":["features"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"properties":{"name":{"type":"string"}},"required":["name"],"type":"object"}}}}}},"/features/request":{"get":{"operationId":"FeatureShowcaseController_Request","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"requestId":{"type":"string"},"sameRequestId":{"type":"boolean"}},"required":["requestId","sameRequestId"],"type":"object"}}}}},"tags":["features"],"security":[],"parameters":[]}},"/features/response":{"get":{"operationId":"FeatureShowcaseController_Response","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"message":{"type":"string"}},"required":["message"],"type":"object"}}}},"409":{"description":"","content":{"application/json":{"schema":{"properties":{"message":{"type":"string"}},"required":["message"],"type":"object"}}},"headers":{"x-demo-response":{"schema":{"type":"string"},"required":true}}}},"tags":["features"],"security":[],"parameters":[{"in":"query","name":"conflict","required":false,"schema":{"default":false,"type":"boolean"}}]}},"/features/media":{"post":{"operationId":"FeatureShowcaseController_Media","responses":{"200":{"description":"Ok","content":{"text/plain":{"schema":{"type":"string"}}}}},"tags":["features"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/vnd.playground+json":{"schema":{"$ref":"#/components/schemas/GreetingInput"}}}}}},"/features/verbs":{"put":{"operationId":"FeatureShowcaseController_Put","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/GreetingInput"}}}}},"tags":["features"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/GreetingInput"}}}}},"patch":{"operationId":"FeatureShowcaseController_Patch","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/GreetingInput"}}}}},"tags":["features"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"properties":{"name":{"type":"string"}},"required":["name"],"type":"object"}}}}},"delete":{"operationId":"FeatureShowcaseController_Remove","responses":{"204":{"description":""}},"tags":["features"],"security":[],"parameters":[]},"options":{"operationId":"FeatureShowcaseController_Options","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"methods":{"items":{"type":"string"},"type":"array"}},"required":["methods"],"type":"object"}}}}},"tags":["features"],"security":[],"parameters":[]},"head":{"operationId":"ExpressHeadShowcaseController_Head","responses":{"204":{"description":"No content"}},"tags":["Features"],"security":[],"parameters":[]}},"/features/legacy":{"get":{"operationId":"FeatureShowcaseController_Legacy","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"deprecated":{"type":"boolean"}},"required":["deprecated"],"type":"object"}}}}},"tags":["features"],"deprecated":true,"security":[],"parameters":[],"x-playground":"legacy"}},"/validation/external/zod":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithZod","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/TaggedEntityPayload"}}}}},"description":"Validates a tagged entity payload with Zod.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/TaggedEntityPayload"}],"x-schema-validator":"zod"}}}}}},"/validation/external/joi":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithJoi","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}}}}},"description":"Validates an audited payload with Joi.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}],"x-schema-validator":"joi"}}}}}},"/validation/external/yup":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithYup","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/TaggedEntityPayload"}}}}},"description":"Validates a tagged entity payload with Yup using the object-form configuration.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/TaggedEntityPayload"}],"x-schema-validator":"yup"}}}}}},"/validation/external/superstruct":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithSuperstruct","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}}}}},"description":"Validates an audited payload with Superstruct.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/AuditedTaggedEntityPayload"}],"x-schema-validator":"superstruct"}}}}}},"/validation/external/ioTs":{"post":{"operationId":"ExternalValidationShowcaseController_ValidateWithIoTs","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/WagerSubmission"}}}}},"description":"Validates a wager submission with io-ts branded codecs.","tags":["validation"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"allOf":[{"$ref":"#/components/schemas/WagerSubmission"}],"x-schema-validator":"io-ts"}}}}}},"/catalog/featured":{"get":{"operationId":"CatalogLookupController_GetFeaturedCatalog","responses":{"200":{"description":"Featured catalog cards loaded","content":{"application/json":{"schema":{"$ref":"#/components/schemas/FeaturedCatalogEnvelope"},"examples":{"Example 1":{"value":{"audience":"retail","generatedAt":"2026-04-11T15:00:00.000Z","items":[{"availableUnits":42,"market":"us","merchandisingLabel":"new-arrival","sku":"SKU-ALPHA-1","title":"Transit Backpack","unitPrice":{"amount":128,"currency":"USD"},"warehouse":"north-hub"}]}}}}}}},"description":"Returns a curated merchandising strip for a known audience segment.","tags":["catalog"],"security":[],"parameters":[{"in":"query","name":"audience","required":false,"schema":{"default":"retail","type":"string"}}]}},"/catalog/{sku}":{"get":{"operationId":"CatalogLookupController_GetCatalogItem","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/CatalogItemView"}}}}},"description":"Resolves one SKU while allowing the caller to pin market context and warehouse context.","tags":["catalog"],"security":[],"parameters":[{"in":"path","name":"sku","required":true,"schema":{"type":"string"}},{"in":"header","name":"x-market","required":false,"schema":{"$ref":"#/components/schemas/MarketCode"}},{"in":"query","name":"warehouse","required":false,"schema":{"type":"string"}}]}},"/middleware/express/trace":{"get":{"operationId":"ExpressMiddlewareShowcaseController_GetTrace","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"$ref":"#/components/schemas/MiddlewareTraceView"}}}}},"description":"Runs controller-level and method-level Express middleware before returning the trace.","tags":["middleware"],"security":[],"parameters":[]}}},"servers":[{"url":"http://127.0.0.1:3101/v1"}]},"yaml":"openapi: 3.1.0\ncomponents:\n  examples: {}\n  headers: {}\n  parameters: {}\n  requestBodies: {}\n  responses: {}\n  schemas:\n    SpecPathShowcaseStateView:\n      properties:\n        customCacheGets:\n          type: number\n          format: double\n        customCacheSets:\n          type: number\n          format: double\n        customStreamCalls:\n          type: number\n          format: double\n        customStringCalls:\n          type: number\n          format: double\n      required:\n        - customCacheGets\n        - customCacheSets\n        - customStreamCalls\n        - customStringCalls\n      type: object\n      additionalProperties: false\n    SpecPathShowcaseStatusView:\n      properties:\n        availableDocsTargets:\n          items:\n            type: string\n          type: array\n        availableSpecTargets:\n          items:\n            type: string\n          type: array\n        conditionalSpecTargets:\n          items:\n            type: string\n          type: array\n        disabledSpecTargets:\n          items:\n            type: string\n          type: array\n        state:\n          $ref: \"#/components/schemas/SpecPathShowcaseStateView\"\n      required:\n        - availableDocsTargets\n        - availableSpecTargets\n        - conditionalSpecTargets\n        - disabledSpecTargets\n        - state\n      type: object\n      additionalProperties: false\n    CarrierCode:\n      type: string\n      enum:\n        - postal-priority\n        - city-bike\n    ServiceLevelCode:\n      type: string\n      enum:\n        - standard\n        - expedited\n    SupportedCurrencyCode:\n      type: string\n      enum:\n        - USD\n        - EUR\n    ShippingQuoteView:\n      properties:\n        quoteId:\n          type: string\n        carrierCode:\n          $ref: \"#/components/schemas/CarrierCode\"\n        serviceLevel:\n          $ref: \"#/components/schemas/ServiceLevelCode\"\n        destinationLabel:\n          type: string\n        currency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        estimatedBusinessDays:\n          type: number\n          format: double\n        quotedAmount:\n          type: number\n          format: double\n      required:\n        - quoteId\n        - carrierCode\n        - serviceLevel\n        - destinationLabel\n        - currency\n        - estimatedBusinessDays\n        - quotedAmount\n      type: object\n      additionalProperties: false\n    ShippingQuoteRequestQuery:\n      properties:\n        destinationCountryCode:\n          type: string\n        destinationPostalCode:\n          type: string\n        parcels:\n          type: number\n          format: double\n          minimum: 1\n        expedited:\n          type: boolean\n        market:\n          type: string\n          enum:\n            - us\n            - eu\n      required:\n        - destinationCountryCode\n        - destinationPostalCode\n        - parcels\n        - expedited\n        - market\n      type: object\n      additionalProperties: false\n    PlaygroundUser:\n      properties:\n        name:\n          type: string\n        scheme:\n          type: string\n      required:\n        - name\n        - scheme\n      type: object\n      additionalProperties: false\n    MoneyAmount:\n      properties:\n        currency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        amount:\n          type: number\n          format: double\n      required:\n        - currency\n        - amount\n      type: object\n      additionalProperties: false\n    OrderDraftReceipt:\n      properties:\n        draftId:\n          type: string\n        customerId:\n          type: string\n        shippingPostalCode:\n          type: string\n        status:\n          type: string\n          enum:\n            - draft\n          nullable: false\n        lineCount:\n          type: number\n          format: double\n        subtotal:\n          $ref: \"#/components/schemas/MoneyAmount\"\n        notes:\n          type: string\n      required:\n        - draftId\n        - customerId\n        - shippingPostalCode\n        - status\n        - lineCount\n        - subtotal\n      type: object\n      additionalProperties: false\n    OrderLineInput:\n      properties:\n        sku:\n          type: string\n        quantity:\n          type: number\n          format: double\n        unitPrice:\n          type: number\n          format: double\n      required:\n        - sku\n        - quantity\n        - unitPrice\n      type: object\n      additionalProperties: false\n    CreateOrderDraftRequest:\n      properties:\n        customerId:\n          type: string\n        requestedCurrency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        shippingPostalCode:\n          type: string\n        notes:\n          type: string\n        lines:\n          items:\n            $ref: \"#/components/schemas/OrderLineInput\"\n          type: array\n      required:\n        - customerId\n        - requestedCurrency\n        - shippingPostalCode\n        - lines\n      type: object\n      additionalProperties: false\n    DraftPricingView:\n      properties:\n        currency:\n          $ref: \"#/components/schemas/SupportedCurrencyCode\"\n        subtotal:\n          $ref: \"#/components/schemas/MoneyAmount\"\n        tax:\n          $ref: \"#/components/schemas/MoneyAmount\"\n        grandTotal:\n          $ref: \"#/components/schemas/MoneyAmount\"\n      required:\n        - currency\n        - subtotal\n        - tax\n        - grandTotal\n      type: object\n      additionalProperties: false\n    GreetingView:\n      properties:\n        greeting:\n          type: string\n        requestId:\n          type: string\n      required:\n        - greeting\n        - requestId\n      type: object\n      additionalProperties: false\n    GreetingInput:\n      properties:\n        name:\n          type: string\n      required:\n        - name\n      type: object\n      additionalProperties: false\n    ValidationLifecycleStatus:\n      type: string\n      enum:\n        - active\n        - disabled\n    TaggedEntityPayload:\n      properties:\n        name:\n          type: string\n        status:\n          $ref: \"#/components/schemas/ValidationLifecycleStatus\"\n        tags:\n          items:\n            type: string\n          type: array\n      required:\n        - name\n        - status\n        - tags\n      type: object\n      additionalProperties: false\n    AuditedTaggedEntityPayload:\n      properties:\n        name:\n          type: string\n        status:\n          $ref: \"#/components/schemas/ValidationLifecycleStatus\"\n        tags:\n          items:\n            type: string\n          type: array\n        auditId:\n          type: number\n          format: double\n      required:\n        - name\n        - status\n        - tags\n        - auditId\n      type: object\n      additionalProperties: false\n    Branded_number.PositiveFloatBrand_:\n      allOf:\n        - type: number\n          format: double\n    Branded_number.IntBrand_:\n      allOf:\n        - type: number\n          format: double\n    Branded_Branded_number.IntBrand_.PositiveIntegerBrand_:\n      allOf:\n        - $ref: \"#/components/schemas/Branded_number.IntBrand_\"\n    WagerSubmission:\n      properties:\n        outcome:\n          type: number\n          format: double\n        amount:\n          type: number\n          format: double\n      required:\n        - outcome\n        - amount\n      type: object\n    MarketCode:\n      type: string\n      enum:\n        - us\n        - eu\n    CatalogItemView:\n      properties:\n        sku:\n          type: string\n        title:\n          type: string\n        market:\n          $ref: \"#/components/schemas/MarketCode\"\n        warehouse:\n          type: string\n        merchandisingLabel:\n          type: string\n        availableUnits:\n          type: number\n          format: double\n        unitPrice:\n          $ref: \"#/components/schemas/MoneyAmount\"\n      required:\n        - sku\n        - title\n        - market\n        - warehouse\n        - merchandisingLabel\n        - availableUnits\n        - unitPrice\n      type: object\n      additionalProperties: false\n    FeaturedCatalogEnvelope:\n      properties:\n        audience:\n          type: string\n        generatedAt:\n          type: string\n          format: date-time\n        items:\n          items:\n            $ref: \"#/components/schemas/CatalogItemView\"\n          type: array\n      required:\n        - audience\n        - generatedAt\n        - items\n      type: object\n      additionalProperties: false\n    MiddlewareTraceView:\n      properties:\n        events:\n          items:\n            type: string\n          type: array\n        framework:\n          type: string\n      required:\n        - events\n        - framework\n      type: object\n      additionalProperties: false\n  securitySchemes:\n    api_key:\n      type: apiKey\n      name: x-api-key\n      in: header\n    bearer:\n      type: oauth2\n      flows:\n        implicit:\n          authorizationUrl: https://example.invalid/authorize\n          scopes:\n            read: Read demo data\n            write: Write demo data\ninfo:\n  title: tsoa-next Playground API\n  version: 1.0.0\n  description: Reference controllers inspired by tsoa-next upstream fixtures,\n    exposed through Express, Koa, and Hapi.\n  license:\n    name: MIT\n  contact:\n    name: Vanna DiCatania\n    email: vanna@dicatania.me\npaths:\n  /uploads/single:\n    post:\n      operationId: UploadShowcaseController_Single\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  content:\n                    type: string\n                  bytes:\n                    type: number\n                    format: double\n                  name:\n                    type: string\n                  title:\n                    type: string\n                required:\n                  - content\n                  - bytes\n                  - name\n                  - title\n                type: object\n      tags:\n        - uploads\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          multipart/form-data:\n            schema:\n              type: object\n              properties:\n                title:\n                  type: string\n                asset:\n                  type: string\n                  format: binary\n              required:\n                - title\n                - asset\n  /uploads/many:\n    post:\n      operationId: UploadShowcaseController_Many\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  contents:\n                    items:\n                      type: string\n                    type: array\n                  names:\n                    items:\n                      type: string\n                    type: array\n                required:\n                  - contents\n                  - names\n                type: object\n      tags:\n        - uploads\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          multipart/form-data:\n            schema:\n              type: object\n              properties:\n                assets:\n                  items:\n                    type: string\n                    format: binary\n                  type: array\n              required:\n                - assets\n  /specPath:\n    get:\n      operationId: SpecPathShowcaseController_GetSpecPathStatus\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/SpecPathShowcaseStatusView\"\n      description: Summarizes the available SpecPath targets and the current\n        custom-handler state.\n      tags:\n        - spec\n      security: []\n      parameters: []\n  /specPath/state:\n    get:\n      operationId: SpecPathShowcaseController_GetSpecPathState\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/SpecPathShowcaseStateView\"\n      description: Returns the current custom SpecPath handler/cache counters.\n      tags:\n        - spec\n      security: []\n      parameters: []\n  /specPath/state/reset:\n    post:\n      operationId: SpecPathShowcaseController_ResetState\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/SpecPathShowcaseStateView\"\n      description: Resets the custom SpecPath handler/cache counters so repeatability\n        is easy in tests.\n      tags:\n        - spec\n      security: []\n      parameters: []\n  /shipping/quote:\n    get:\n      operationId: ShippingQuoteController_GetShippingQuote\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/ShippingQuoteView\"\n      description: Calculates a delivery quote from grouped query string fields.\n      tags:\n        - shipping\n      security: []\n      parameters:\n        - in: query\n          name: destinationCountryCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: destinationPostalCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: parcels\n          required: true\n          schema:\n            format: double\n            type: number\n            minimum: 1\n        - in: query\n          name: expedited\n          required: true\n          schema:\n            type: boolean\n        - in: query\n          name: market\n          required: true\n          schema:\n            type: string\n            enum:\n              - us\n              - eu\n  /shipping/carriers/{carrierCode}/quote:\n    get:\n      operationId: ShippingQuoteController_GetCarrierShippingQuote\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/ShippingQuoteView\"\n      description: Calculates the same quote while allowing the client to force a\n        specific carrier lane.\n      tags:\n        - shipping\n      security: []\n      parameters:\n        - in: path\n          name: carrierCode\n          required: true\n          schema:\n            $ref: \"#/components/schemas/CarrierCode\"\n        - in: query\n          name: destinationCountryCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: destinationPostalCode\n          required: true\n          schema:\n            type: string\n        - in: query\n          name: parcels\n          required: true\n          schema:\n            format: double\n            type: number\n            minimum: 1\n        - in: query\n          name: expedited\n          required: true\n          schema:\n            type: boolean\n        - in: query\n          name: market\n          required: true\n          schema:\n            type: string\n            enum:\n              - us\n              - eu\n  /security/root:\n    get:\n      operationId: SecurityShowcaseController_Root\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  user:\n                    $ref: \"#/components/schemas/PlaygroundUser\"\n                type: object\n      tags:\n        - security\n      security:\n        - api_key: []\n      parameters: []\n  /security/public:\n    get:\n      operationId: SecurityShowcaseController_Public\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  public:\n                    type: boolean\n                required:\n                  - public\n                type: object\n      tags:\n        - security\n      security: []\n      parameters: []\n  /security/either:\n    get:\n      operationId: SecurityShowcaseController_Either\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  authorized:\n                    type: boolean\n                required:\n                  - authorized\n                type: object\n      tags:\n        - security\n      security:\n        - api_key: []\n        - bearer:\n            - read\n      parameters: []\n  /security/both:\n    get:\n      operationId: SecurityShowcaseController_Both\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  authorized:\n                    type: boolean\n                required:\n                  - authorized\n                type: object\n      tags:\n        - security\n      security:\n        - api_key: []\n          bearer:\n            - read\n      parameters: []\n  /security/scoped:\n    get:\n      operationId: SecurityShowcaseController_Scoped\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  authorized:\n                    type: boolean\n                required:\n                  - authorized\n                type: object\n      tags:\n        - security\n      security:\n        - bearer:\n            - write\n      parameters: []\n  /order-drafts:\n    post:\n      operationId: OrderDraftController_CreateOrderDraft\n      responses:\n        \"201\":\n          description: Draft order staged\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/OrderDraftReceipt\"\n      description: Stages a draft order so a client can review the payload before\n        final submission.\n      tags:\n        - orders\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: \"#/components/schemas/CreateOrderDraftRequest\"\n  /order-drafts/{draftId}:\n    get:\n      operationId: OrderDraftController_GetOrderDraft\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/OrderDraftReceipt\"\n      description: Retrieves a staged draft order by its identifier.\n      tags:\n        - orders\n      security: []\n      parameters:\n        - in: path\n          name: draftId\n          required: true\n          schema:\n            type: string\n  /order-drafts/pricing:\n    post:\n      operationId: OrderDraftController_PriceOrderDraft\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/DraftPricingView\"\n      description: Reprices a draft payload using a caller-selected output currency.\n      tags:\n        - orders\n      security: []\n      parameters:\n        - in: query\n          name: currency\n          required: false\n          schema:\n            $ref: \"#/components/schemas/SupportedCurrencyCode\"\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: \"#/components/schemas/CreateOrderDraftRequest\"\n  /features/greeting:\n    post:\n      operationId: createGreeting\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/GreetingView\"\n              examples:\n                Example 1:\n                  value:\n                    greeting: Hello Ada\n                    requestId: demo\n      tags:\n        - features\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: \"#/components/schemas/GreetingInput\"\n  /features/body-property:\n    post:\n      operationId: FeatureShowcaseController_BodyProperty\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  name:\n                    type: string\n                required:\n                  - name\n                type: object\n      tags:\n        - features\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              properties:\n                name:\n                  type: string\n              required:\n                - name\n              type: object\n  /features/request:\n    get:\n      operationId: FeatureShowcaseController_Request\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  requestId:\n                    type: string\n                  sameRequestId:\n                    type: boolean\n                required:\n                  - requestId\n                  - sameRequestId\n                type: object\n      tags:\n        - features\n      security: []\n      parameters: []\n  /features/response:\n    get:\n      operationId: FeatureShowcaseController_Response\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  message:\n                    type: string\n                required:\n                  - message\n                type: object\n        \"409\":\n          description: \"\"\n          content:\n            application/json:\n              schema:\n                properties:\n                  message:\n                    type: string\n                required:\n                  - message\n                type: object\n          headers:\n            x-demo-response:\n              schema:\n                type: string\n              required: true\n      tags:\n        - features\n      security: []\n      parameters:\n        - in: query\n          name: conflict\n          required: false\n          schema:\n            default: false\n            type: boolean\n  /features/media:\n    post:\n      operationId: FeatureShowcaseController_Media\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            text/plain:\n              schema:\n                type: string\n      tags:\n        - features\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/vnd.playground+json:\n            schema:\n              $ref: \"#/components/schemas/GreetingInput\"\n  /features/verbs:\n    put:\n      operationId: FeatureShowcaseController_Put\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/GreetingInput\"\n      tags:\n        - features\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: \"#/components/schemas/GreetingInput\"\n    patch:\n      operationId: FeatureShowcaseController_Patch\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/GreetingInput\"\n      tags:\n        - features\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              properties:\n                name:\n                  type: string\n              required:\n                - name\n              type: object\n    delete:\n      operationId: FeatureShowcaseController_Remove\n      responses:\n        \"204\":\n          description: \"\"\n      tags:\n        - features\n      security: []\n      parameters: []\n    options:\n      operationId: FeatureShowcaseController_Options\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  methods:\n                    items:\n                      type: string\n                    type: array\n                required:\n                  - methods\n                type: object\n      tags:\n        - features\n      security: []\n      parameters: []\n    head:\n      operationId: ExpressHeadShowcaseController_Head\n      responses:\n        \"204\":\n          description: No content\n      tags:\n        - Features\n      security: []\n      parameters: []\n  /features/legacy:\n    get:\n      operationId: FeatureShowcaseController_Legacy\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                properties:\n                  deprecated:\n                    type: boolean\n                required:\n                  - deprecated\n                type: object\n      tags:\n        - features\n      deprecated: true\n      security: []\n      parameters: []\n      x-playground: legacy\n  /validation/external/zod:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithZod\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/TaggedEntityPayload\"\n      description: Validates a tagged entity payload with Zod.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/TaggedEntityPayload\"\n              x-schema-validator: zod\n  /validation/external/joi:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithJoi\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n      description: Validates an audited payload with Joi.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n              x-schema-validator: joi\n  /validation/external/yup:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithYup\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/TaggedEntityPayload\"\n      description: Validates a tagged entity payload with Yup using the object-form\n        configuration.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/TaggedEntityPayload\"\n              x-schema-validator: yup\n  /validation/external/superstruct:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithSuperstruct\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n      description: Validates an audited payload with Superstruct.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/AuditedTaggedEntityPayload\"\n              x-schema-validator: superstruct\n  /validation/external/ioTs:\n    post:\n      operationId: ExternalValidationShowcaseController_ValidateWithIoTs\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/WagerSubmission\"\n      description: Validates a wager submission with io-ts branded codecs.\n      tags:\n        - validation\n      security: []\n      parameters: []\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              allOf:\n                - $ref: \"#/components/schemas/WagerSubmission\"\n              x-schema-validator: io-ts\n  /catalog/featured:\n    get:\n      operationId: CatalogLookupController_GetFeaturedCatalog\n      responses:\n        \"200\":\n          description: Featured catalog cards loaded\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/FeaturedCatalogEnvelope\"\n              examples:\n                Example 1:\n                  value:\n                    audience: retail\n                    generatedAt: 2026-04-11T15:00:00.000Z\n                    items:\n                      - availableUnits: 42\n                        market: us\n                        merchandisingLabel: new-arrival\n                        sku: SKU-ALPHA-1\n                        title: Transit Backpack\n                        unitPrice:\n                          amount: 128\n                          currency: USD\n                        warehouse: north-hub\n      description: Returns a curated merchandising strip for a known audience segment.\n      tags:\n        - catalog\n      security: []\n      parameters:\n        - in: query\n          name: audience\n          required: false\n          schema:\n            default: retail\n            type: string\n  /catalog/{sku}:\n    get:\n      operationId: CatalogLookupController_GetCatalogItem\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/CatalogItemView\"\n      description: Resolves one SKU while allowing the caller to pin market context\n        and warehouse context.\n      tags:\n        - catalog\n      security: []\n      parameters:\n        - in: path\n          name: sku\n          required: true\n          schema:\n            type: string\n        - in: header\n          name: x-market\n          required: false\n          schema:\n            $ref: \"#/components/schemas/MarketCode\"\n        - in: query\n          name: warehouse\n          required: false\n          schema:\n            type: string\n  /middleware/express/trace:\n    get:\n      operationId: ExpressMiddlewareShowcaseController_GetTrace\n      responses:\n        \"200\":\n          description: Ok\n          content:\n            application/json:\n              schema:\n                $ref: \"#/components/schemas/MiddlewareTraceView\"\n      description: Runs controller-level and method-level Express middleware before\n        returning the trace.\n      tags:\n        - middleware\n      security: []\n      parameters: []\nservers:\n  - url: http://127.0.0.1:3101/v1\n"} as Parameters<typeof createEmbeddedSpecGenerator>[0]);

export function RegisterRoutes(app: Router,opts?:{multer?:ReturnType<typeof multer>; validation?: Tsoa.ValidationContext}) {
    // #####################################################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/tsoa-next/tsoa-next
    // #####################################################################################################################################
    const upload = opts?.multer ||  multer({"limits":{"fileSize":8388608}});
    const additionalProps: AdditionalProps = {
      ...{"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true},
      validation: opts?.validation,
    };
    const templateService = new ExpressTemplateService(models, additionalProps);
    const registeredGetPaths = new Set<string>(["/v1/specPath","/v1/specPath/state","/v1/shipping/quote","/v1/shipping/carriers/:carrierCode/quote","/v1/security/root","/v1/security/public","/v1/security/either","/v1/security/both","/v1/security/scoped","/v1/order-drafts/:draftId","/v1/features/request","/v1/features/response","/v1/features/legacy","/v1/features/hidden","/v1/catalog/featured","/v1/catalog/:sku","/v1/middleware/express/trace"]);
    for (const specPath of fetchSpecPaths(UploadShowcaseController)) {
        if (specPath.gate === false) {
            continue;
        }

        const specFullPath = normalisePath('/v1/uploads' + specPath.normalizedPath, '/', '', false);
        if (registeredGetPaths.has(specFullPath)) {
            throw new Error(`Duplicate GET route detected while registering @SpecPath for UploadShowcaseController at '${specFullPath}'.`);
        }
        registeredGetPaths.add(specFullPath);

        app.get(specFullPath, async function UploadShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: UploadShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
        });
    }
    for (const specPath of fetchSpecPaths(SpecPathShowcaseController)) {
        if (specPath.gate === false) {
            continue;
        }

        const specFullPath = normalisePath('/v1/specPath' + specPath.normalizedPath, '/', '', false);
        if (registeredGetPaths.has(specFullPath)) {
            throw new Error(`Duplicate GET route detected while registering @SpecPath for SpecPathShowcaseController at '${specFullPath}'.`);
        }
        registeredGetPaths.add(specFullPath);

        app.get(specFullPath, async function SpecPathShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: SpecPathShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
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

        app.get(specFullPath, async function ShippingQuoteController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: ShippingQuoteController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
        });
    }
    for (const specPath of fetchSpecPaths(SecurityShowcaseController)) {
        if (specPath.gate === false) {
            continue;
        }

        const specFullPath = normalisePath('/v1/security' + specPath.normalizedPath, '/', '', false);
        if (registeredGetPaths.has(specFullPath)) {
            throw new Error(`Duplicate GET route detected while registering @SpecPath for SecurityShowcaseController at '${specFullPath}'.`);
        }
        registeredGetPaths.add(specFullPath);

        app.get(specFullPath, async function SecurityShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: SecurityShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
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

        app.get(specFullPath, async function OrderDraftController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: OrderDraftController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
        });
    }
    for (const specPath of fetchSpecPaths(FeatureShowcaseController)) {
        if (specPath.gate === false) {
            continue;
        }

        const specFullPath = normalisePath('/v1/features' + specPath.normalizedPath, '/', '', false);
        if (registeredGetPaths.has(specFullPath)) {
            throw new Error(`Duplicate GET route detected while registering @SpecPath for FeatureShowcaseController at '${specFullPath}'.`);
        }
        registeredGetPaths.add(specFullPath);

        app.get(specFullPath, async function FeatureShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: FeatureShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
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

        app.get(specFullPath, async function ExternalValidationShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: ExternalValidationShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
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

        app.get(specFullPath, async function CatalogLookupController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: CatalogLookupController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
        });
    }
    for (const specPath of fetchSpecPaths(ExpressMiddlewareShowcaseController)) {
        if (specPath.gate === false) {
            continue;
        }

        const specFullPath = normalisePath('/v1/middleware/express' + specPath.normalizedPath, '/', '', false);
        if (registeredGetPaths.has(specFullPath)) {
            throw new Error(`Duplicate GET route detected while registering @SpecPath for ExpressMiddlewareShowcaseController at '${specFullPath}'.`);
        }
        registeredGetPaths.add(specFullPath);

        app.get(specFullPath, async function ExpressMiddlewareShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: ExpressMiddlewareShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
        });
    }
    for (const specPath of fetchSpecPaths(ExpressHeadShowcaseController)) {
        if (specPath.gate === false) {
            continue;
        }

        const specFullPath = normalisePath('/v1/features' + specPath.normalizedPath, '/', '', false);
        if (registeredGetPaths.has(specFullPath)) {
            throw new Error(`Duplicate GET route detected while registering @SpecPath for ExpressHeadShowcaseController at '${specFullPath}'.`);
        }
        registeredGetPaths.add(specFullPath);

        app.get(specFullPath, async function ExpressHeadShowcaseController_specPath(request: ExRequest, response: ExResponse, next: any) {
            try {
                const specResponse = await resolveSpecPathResponse({
                    controllerClass: ExpressHeadShowcaseController,
                    fullPath: specFullPath,
                    request,
                    response,
                    runtime: 'express',
                    specGenerator,
                    specPath,
                });

                if (specResponse.contentType) {
                    response.type(specResponse.contentType);
                }

                response.status(200);
                if (typeof specResponse.body === 'string') {
                    response.send(specResponse.body);
                    return;
                }

                pipeline(specResponse.body, response, error => {
                    if (error) {
                        next(error);
                    }
                });
                return;
            } catch (err) {
                return next(err);
            }
        });
    }

        const argsUploadShowcaseController_single: Record<string, TsoaRoute.ParameterSchema> = {
                title: {"in":"formData","name":"title","parameterIndex":0,"required":true,"dataType":"string"},
                asset: {"in":"formData","name":"asset","parameterIndex":1,"required":true,"dataType":"file"},
        };
        app.post('/v1/uploads/single',
            upload.fields([
                {
                    name: "asset",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(UploadShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(UploadShowcaseController.prototype.single)),

            async function UploadShowcaseController_single(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUploadShowcaseController_single, controllerClass: UploadShowcaseController, methodName: 'single', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<UploadShowcaseController>(UploadShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'single',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsUploadShowcaseController_many: Record<string, TsoaRoute.ParameterSchema> = {
                assets: {"in":"formData","name":"assets","parameterIndex":0,"required":true,"dataType":"array","array":{"dataType":"file"}},
        };
        app.post('/v1/uploads/many',
            upload.fields([
                {
                    name: "assets",
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(UploadShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(UploadShowcaseController.prototype.many)),

            async function UploadShowcaseController_many(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUploadShowcaseController_many, controllerClass: UploadShowcaseController, methodName: 'many', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<UploadShowcaseController>(UploadShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'many',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSpecPathShowcaseController_getSpecPathStatus: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/specPath',
            ...(fetchMiddlewares<RequestHandler>(SpecPathShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SpecPathShowcaseController.prototype.getSpecPathStatus)),

            async function SpecPathShowcaseController_getSpecPathStatus(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSpecPathShowcaseController_getSpecPathStatus, controllerClass: SpecPathShowcaseController, methodName: 'getSpecPathStatus', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SpecPathShowcaseController>(SpecPathShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getSpecPathStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSpecPathShowcaseController_getSpecPathState: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/specPath/state',
            ...(fetchMiddlewares<RequestHandler>(SpecPathShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SpecPathShowcaseController.prototype.getSpecPathState)),

            async function SpecPathShowcaseController_getSpecPathState(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSpecPathShowcaseController_getSpecPathState, controllerClass: SpecPathShowcaseController, methodName: 'getSpecPathState', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SpecPathShowcaseController>(SpecPathShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getSpecPathState',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSpecPathShowcaseController_resetState: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/v1/specPath/state/reset',
            ...(fetchMiddlewares<RequestHandler>(SpecPathShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SpecPathShowcaseController.prototype.resetState)),

            async function SpecPathShowcaseController_resetState(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSpecPathShowcaseController_resetState, controllerClass: SpecPathShowcaseController, methodName: 'resetState', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SpecPathShowcaseController>(SpecPathShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'resetState',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsShippingQuoteController_getShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"queries","name":"request","parameterIndex":0,"required":true,"ref":"ShippingQuoteRequestQuery"},
        };
        app.get('/v1/shipping/quote',
            ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController)),
            ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController.prototype.getShippingQuote)),

            async function ShippingQuoteController_getShippingQuote(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsShippingQuoteController_getShippingQuote, controllerClass: ShippingQuoteController, methodName: 'getShippingQuote', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ShippingQuoteController>(ShippingQuoteController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getShippingQuote',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsShippingQuoteController_getCarrierShippingQuote: Record<string, TsoaRoute.ParameterSchema> = {
                carrierCode: {"in":"path","name":"carrierCode","parameterIndex":0,"required":true,"ref":"CarrierCode"},
                request: {"in":"queries","name":"request","parameterIndex":1,"required":true,"ref":"ShippingQuoteRequestQuery"},
        };
        app.get('/v1/shipping/carriers/:carrierCode/quote',
            ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController)),
            ...(fetchMiddlewares<RequestHandler>(ShippingQuoteController.prototype.getCarrierShippingQuote)),

            async function ShippingQuoteController_getCarrierShippingQuote(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsShippingQuoteController_getCarrierShippingQuote, controllerClass: ShippingQuoteController, methodName: 'getCarrierShippingQuote', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ShippingQuoteController>(ShippingQuoteController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getCarrierShippingQuote',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSecurityShowcaseController_root: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","parameterIndex":0,"required":true,"dataType":"object"},
        };
        app.get('/v1/security/root',
            authenticateMiddleware([{"api_key":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController.prototype.root)),

            async function SecurityShowcaseController_root(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSecurityShowcaseController_root, controllerClass: SecurityShowcaseController, methodName: 'root', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SecurityShowcaseController>(SecurityShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'root',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSecurityShowcaseController_public: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/security/public',
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController.prototype.public)),

            async function SecurityShowcaseController_public(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSecurityShowcaseController_public, controllerClass: SecurityShowcaseController, methodName: 'public', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SecurityShowcaseController>(SecurityShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'public',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSecurityShowcaseController_either: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/security/either',
            authenticateMiddleware([{"api_key":[]},{"bearer":["read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController.prototype.either)),

            async function SecurityShowcaseController_either(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSecurityShowcaseController_either, controllerClass: SecurityShowcaseController, methodName: 'either', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SecurityShowcaseController>(SecurityShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'either',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSecurityShowcaseController_both: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/security/both',
            authenticateMiddleware([{"api_key":[],"bearer":["read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController.prototype.both)),

            async function SecurityShowcaseController_both(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSecurityShowcaseController_both, controllerClass: SecurityShowcaseController, methodName: 'both', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SecurityShowcaseController>(SecurityShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'both',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsSecurityShowcaseController_scoped: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/security/scoped',
            authenticateMiddleware([{"bearer":["write"]}]),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(SecurityShowcaseController.prototype.scoped)),

            async function SecurityShowcaseController_scoped(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSecurityShowcaseController_scoped, controllerClass: SecurityShowcaseController, methodName: 'scoped', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<SecurityShowcaseController>(SecurityShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'scoped',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsOrderDraftController_createOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
        };
        app.post('/v1/order-drafts',
            ...(fetchMiddlewares<RequestHandler>(OrderDraftController)),
            ...(fetchMiddlewares<RequestHandler>(OrderDraftController.prototype.createOrderDraft)),

            async function OrderDraftController_createOrderDraft(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderDraftController_createOrderDraft, controllerClass: OrderDraftController, methodName: 'createOrderDraft', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<OrderDraftController>(OrderDraftController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'createOrderDraft',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsOrderDraftController_getOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
                draftId: {"in":"path","name":"draftId","parameterIndex":0,"required":true,"dataType":"string"},
        };
        app.get('/v1/order-drafts/:draftId',
            ...(fetchMiddlewares<RequestHandler>(OrderDraftController)),
            ...(fetchMiddlewares<RequestHandler>(OrderDraftController.prototype.getOrderDraft)),

            async function OrderDraftController_getOrderDraft(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderDraftController_getOrderDraft, controllerClass: OrderDraftController, methodName: 'getOrderDraft', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<OrderDraftController>(OrderDraftController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getOrderDraft',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsOrderDraftController_priceOrderDraft: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","parameterIndex":0,"required":true,"ref":"CreateOrderDraftRequest"},
                currency: {"default":"USD","in":"query","name":"currency","parameterIndex":1,"ref":"SupportedCurrencyCode"},
        };
        app.post('/v1/order-drafts/pricing',
            ...(fetchMiddlewares<RequestHandler>(OrderDraftController)),
            ...(fetchMiddlewares<RequestHandler>(OrderDraftController.prototype.priceOrderDraft)),

            async function OrderDraftController_priceOrderDraft(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrderDraftController_priceOrderDraft, controllerClass: OrderDraftController, methodName: 'priceOrderDraft', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<OrderDraftController>(OrderDraftController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'priceOrderDraft',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_greeting: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","parameterIndex":0,"required":true,"ref":"GreetingInput"},
        };
        app.post('/v1/features/greeting',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.greeting)),

            async function FeatureShowcaseController_greeting(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_greeting, controllerClass: FeatureShowcaseController, methodName: 'greeting', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'greeting',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_bodyProperty: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"body-prop","name":"name","parameterIndex":0,"required":true,"dataType":"string"},
        };
        app.post('/v1/features/body-property',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.bodyProperty)),

            async function FeatureShowcaseController_bodyProperty(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_bodyProperty, controllerClass: FeatureShowcaseController, methodName: 'bodyProperty', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'bodyProperty',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_request: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","parameterIndex":0,"required":true,"dataType":"object"},
                requestId: {"in":"request-prop","name":"playgroundRequestId","parameterIndex":1,"required":true,"dataType":"string"},
        };
        app.get('/v1/features/request',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.request)),

            async function FeatureShowcaseController_request(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_request, controllerClass: FeatureShowcaseController, methodName: 'request', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'request',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_response: Record<string, TsoaRoute.ParameterSchema> = {
                conflict: {"default":false,"in":"query","name":"conflict","parameterIndex":0,"dataType":"boolean"},
                rejected: {"in":"res","name":"409","parameterIndex":1,"required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true}}},
        };
        app.get('/v1/features/response',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.response)),

            async function FeatureShowcaseController_response(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_response, controllerClass: FeatureShowcaseController, methodName: 'response', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'response',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_media: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","parameterIndex":0,"required":true,"ref":"GreetingInput"},
        };
        app.post('/v1/features/media',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.media)),

            async function FeatureShowcaseController_media(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_media, controllerClass: FeatureShowcaseController, methodName: 'media', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'media',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_put: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","parameterIndex":0,"required":true,"ref":"GreetingInput"},
        };
        app.put('/v1/features/verbs',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.put)),

            async function FeatureShowcaseController_put(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_put, controllerClass: FeatureShowcaseController, methodName: 'put', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'put',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_patch: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"body-prop","name":"name","parameterIndex":0,"required":true,"dataType":"string"},
        };
        app.patch('/v1/features/verbs',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.patch)),

            async function FeatureShowcaseController_patch(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_patch, controllerClass: FeatureShowcaseController, methodName: 'patch', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'patch',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_remove: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.delete('/v1/features/verbs',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.remove)),

            async function FeatureShowcaseController_remove(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_remove, controllerClass: FeatureShowcaseController, methodName: 'remove', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'remove',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_options: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.options('/v1/features/verbs',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.options)),

            async function FeatureShowcaseController_options(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_options, controllerClass: FeatureShowcaseController, methodName: 'options', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'options',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_legacy: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/features/legacy',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.legacy)),

            async function FeatureShowcaseController_legacy(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_legacy, controllerClass: FeatureShowcaseController, methodName: 'legacy', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'legacy',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsFeatureShowcaseController_hidden: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/features/hidden',
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(FeatureShowcaseController.prototype.hidden)),

            async function FeatureShowcaseController_hidden(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeatureShowcaseController_hidden, controllerClass: FeatureShowcaseController, methodName: 'hidden', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<FeatureShowcaseController>(FeatureShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'hidden',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExternalValidationShowcaseController_validateWithZod: Record<string, TsoaRoute.ParameterSchema> = {
                payload: {"externalValidator":{"kind":"zod","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
        };
        app.post('/v1/validation/external/zod',
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithZod)),

            async function ExternalValidationShowcaseController_validateWithZod(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExternalValidationShowcaseController_validateWithZod, controllerClass: ExternalValidationShowcaseController, methodName: 'validateWithZod', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExternalValidationShowcaseController>(ExternalValidationShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'validateWithZod',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExternalValidationShowcaseController_validateWithJoi: Record<string, TsoaRoute.ParameterSchema> = {
                payload: {"externalValidator":{"kind":"joi","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
        };
        app.post('/v1/validation/external/joi',
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithJoi)),

            async function ExternalValidationShowcaseController_validateWithJoi(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExternalValidationShowcaseController_validateWithJoi, controllerClass: ExternalValidationShowcaseController, methodName: 'validateWithJoi', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExternalValidationShowcaseController>(ExternalValidationShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'validateWithJoi',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExternalValidationShowcaseController_validateWithYup: Record<string, TsoaRoute.ParameterSchema> = {
                payload: {"externalValidator":{"kind":"yup","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"TaggedEntityPayload"},
        };
        app.post('/v1/validation/external/yup',
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithYup)),

            async function ExternalValidationShowcaseController_validateWithYup(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExternalValidationShowcaseController_validateWithYup, controllerClass: ExternalValidationShowcaseController, methodName: 'validateWithYup', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExternalValidationShowcaseController>(ExternalValidationShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'validateWithYup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExternalValidationShowcaseController_validateWithSuperstruct: Record<string, TsoaRoute.ParameterSchema> = {
                payload: {"externalValidator":{"kind":"superstruct","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"AuditedTaggedEntityPayload"},
        };
        app.post('/v1/validation/external/superstruct',
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithSuperstruct)),

            async function ExternalValidationShowcaseController_validateWithSuperstruct(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExternalValidationShowcaseController_validateWithSuperstruct, controllerClass: ExternalValidationShowcaseController, methodName: 'validateWithSuperstruct', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExternalValidationShowcaseController>(ExternalValidationShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'validateWithSuperstruct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExternalValidationShowcaseController_validateWithIoTs: Record<string, TsoaRoute.ParameterSchema> = {
                payload: {"externalValidator":{"kind":"io-ts","strategy":"external"},"in":"body","name":"payload","parameterIndex":0,"required":true,"validationStrategy":"external","ref":"WagerSubmission"},
        };
        app.post('/v1/validation/external/ioTs',
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExternalValidationShowcaseController.prototype.validateWithIoTs)),

            async function ExternalValidationShowcaseController_validateWithIoTs(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExternalValidationShowcaseController_validateWithIoTs, controllerClass: ExternalValidationShowcaseController, methodName: 'validateWithIoTs', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExternalValidationShowcaseController>(ExternalValidationShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'validateWithIoTs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsCatalogLookupController_getFeaturedCatalog: Record<string, TsoaRoute.ParameterSchema> = {
                audience: {"default":"retail","in":"query","name":"audience","parameterIndex":0,"dataType":"string"},
        };
        app.get('/v1/catalog/featured',
            ...(fetchMiddlewares<RequestHandler>(CatalogLookupController)),
            ...(fetchMiddlewares<RequestHandler>(CatalogLookupController.prototype.getFeaturedCatalog)),

            async function CatalogLookupController_getFeaturedCatalog(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCatalogLookupController_getFeaturedCatalog, controllerClass: CatalogLookupController, methodName: 'getFeaturedCatalog', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<CatalogLookupController>(CatalogLookupController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getFeaturedCatalog',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsCatalogLookupController_getCatalogItem: Record<string, TsoaRoute.ParameterSchema> = {
                sku: {"in":"path","name":"sku","parameterIndex":0,"required":true,"dataType":"string"},
                market: {"default":"us","in":"header","name":"x-market","parameterIndex":1,"ref":"MarketCode"},
                warehouse: {"in":"query","name":"warehouse","parameterIndex":2,"dataType":"string"},
        };
        app.get('/v1/catalog/:sku',
            ...(fetchMiddlewares<RequestHandler>(CatalogLookupController)),
            ...(fetchMiddlewares<RequestHandler>(CatalogLookupController.prototype.getCatalogItem)),

            async function CatalogLookupController_getCatalogItem(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCatalogLookupController_getCatalogItem, controllerClass: CatalogLookupController, methodName: 'getCatalogItem', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<CatalogLookupController>(CatalogLookupController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getCatalogItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExpressMiddlewareShowcaseController_getTrace: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/v1/middleware/express/trace',
            ...(fetchMiddlewares<RequestHandler>(ExpressMiddlewareShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExpressMiddlewareShowcaseController.prototype.getTrace)),

            async function ExpressMiddlewareShowcaseController_getTrace(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpressMiddlewareShowcaseController_getTrace, controllerClass: ExpressMiddlewareShowcaseController, methodName: 'getTrace', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExpressMiddlewareShowcaseController>(ExpressMiddlewareShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'getTrace',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

        const argsExpressHeadShowcaseController_head: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.head('/v1/features/verbs',
            ...(fetchMiddlewares<RequestHandler>(ExpressHeadShowcaseController)),
            ...(fetchMiddlewares<RequestHandler>(ExpressHeadShowcaseController.prototype.head)),

            async function ExpressHeadShowcaseController_head(request: ExRequest, response: ExResponse, next: any) {

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExpressHeadShowcaseController_head, controllerClass: ExpressHeadShowcaseController, methodName: 'head', request, response });

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;
                const controller: any = await container.get<ExpressHeadShowcaseController>(ExpressHeadShowcaseController);
                if (typeof controller['setStatus'] === 'function') {
                    controller.setStatus(undefined);
                }

              await templateService.apiHandler({
                methodName: 'head',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
        }
    }
}
