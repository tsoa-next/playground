import * as t from 'io-ts'
import * as Joi from 'joi'
import { array, integer, object, size, string } from 'superstruct'
import * as yup from 'yup'
import { z } from 'zod'

export type ValidationLifecycleStatus = 'active' | 'disabled'

export interface TaggedEntityPayload {
  name: string
  status: ValidationLifecycleStatus
  tags: string[]
}

export interface AuditedTaggedEntityPayload extends TaggedEntityPayload {
  auditId: number
}

export const zodTaggedEntitySchema = z.object({
  name: z.string().min(3, 'validation.external.zod.name.min'),
  status: z.enum(['active', 'disabled']),
  tags: z.array(z.string()).min(1, 'validation.external.zod.tags.min'),
})

export const joiAuditedTaggedEntitySchema = Joi.object<AuditedTaggedEntityPayload>({
  auditId: Joi.number().integer().positive().required(),
  name: Joi.string().min(3).required(),
  status: Joi.string().valid('active', 'disabled').required(),
  tags: Joi.array().items(Joi.string()).min(1).required(),
})

export const yupTaggedEntitySchema = yup
  .object({
    name: yup.string().required().min(3),
    status: yup.mixed<ValidationLifecycleStatus>().oneOf(['active', 'disabled']).required(),
    tags: yup.array(yup.string().required()).min(1).required(),
  })
  .required()

export const superstructAuditedTaggedEntitySchema = object({
  auditId: integer(),
  name: size(string(), 3, 50),
  status: string(),
  tags: size(array(string()), 1, 10),
})

interface PositiveFloatBrand {
  readonly PositiveFloat: unique symbol
}

interface PositiveIntegerBrand {
  readonly PositiveInteger: unique symbol
}

const positiveFloatCodec = t.brand(
  t.number,
  (value): value is t.Branded<number, PositiveFloatBrand> => Number.isFinite(value) && value > 0,
  'PositiveFloat',
)

const positiveIntegerCodec = t.brand(
  t.Int,
  (value): value is t.Branded<t.Int, PositiveIntegerBrand> => value > 0,
  'PositiveInteger',
)

export const wagerSubmissionCodec = t.type({
  amount: positiveFloatCodec,
  outcome: positiveIntegerCodec,
})

export type WagerSubmission = t.TypeOf<typeof wagerSubmissionCodec>
