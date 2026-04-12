import { Body, Controller, Post, Route, Tags, Validate } from 'tsoa-next'
import {
  AuditedTaggedEntityPayload,
  joiAuditedTaggedEntitySchema,
  superstructAuditedTaggedEntitySchema,
  TaggedEntityPayload,
  wagerSubmissionCodec,
  WagerSubmission,
  yupTaggedEntitySchema,
  zodTaggedEntitySchema,
} from '../models/validationShowcase'

/**
 * Use case: demonstrate every supported external validation adapter in one place so
 * consumers can compare schema-authoring styles while keeping tsoa-next generated
 * metadata and routes in the same application.
 */
@Route('validation/external')
@Tags('validation')
export class ExternalValidationShowcaseController extends Controller {
  /**
   * Validates a tagged entity payload with Zod.
   */
  @Post('zod')
  public validateWithZod(@Body() @Validate(zodTaggedEntitySchema) payload: TaggedEntityPayload): TaggedEntityPayload {
    return payload
  }

  /**
   * Validates an audited payload with Joi.
   */
  @Post('joi')
  public validateWithJoi(
    @Body() @Validate('joi', joiAuditedTaggedEntitySchema) payload: AuditedTaggedEntityPayload,
  ): AuditedTaggedEntityPayload {
    return payload
  }

  /**
   * Validates a tagged entity payload with Yup using the object-form configuration.
   */
  @Post('yup')
  public validateWithYup(
    @Body() @Validate({ kind: 'yup', schema: yupTaggedEntitySchema }) payload: TaggedEntityPayload,
  ): TaggedEntityPayload {
    return payload
  }

  /**
   * Validates an audited payload with Superstruct.
   */
  @Post('superstruct')
  public validateWithSuperstruct(
    @Body() @Validate('superstruct', superstructAuditedTaggedEntitySchema) payload: AuditedTaggedEntityPayload,
  ): AuditedTaggedEntityPayload {
    return payload
  }

  /**
   * Validates a wager submission with io-ts branded codecs.
   */
  @Post('ioTs')
  public validateWithIoTs(
    @Body() @Validate({ kind: 'io-ts', schema: wagerSubmissionCodec }) payload: WagerSubmission,
  ): WagerSubmission {
    return payload
  }
}

