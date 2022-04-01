import type { Ucan } from 'ucans'
import * as ucan from 'ucans'

export type Validation = {
  notValidYet: boolean
  active: boolean
  valid: boolean
  validIssuer: boolean
  validProofs: boolean
}

export const decode = async (token: string): Promise<Ucan | null> => {
  try {
    return await ucan.validate(token, { checkIsExpired: false, checkIsTooEarly: false, checkSignature: false })
  } catch (err) {
    console.log(err)
    return null
  }
}

export const validate = async (token: string): Promise<{ validation: Validation; ucan: Ucan } | null> => {
  const parsed = await decode(token)
  const [header, payload, signature] = token.split('.')
  if (parsed == null || header == null || payload == null || signature == null) {
    return null
  }
  const notValidYet = ucan.isTooEarly(parsed)
  const active = !ucan.isExpired(parsed)
  const valid = await ucan.verifySignatureUtf8(`${header}.${payload}`, signature, parsed.payload.iss)
  const { validIssuer, validProofs } = await validateProofs(parsed.payload.prf, parsed.payload.iss)

  return {
    validation: {
      notValidYet,
      active,
      valid,
      validIssuer,
      validProofs,
    },
    ucan: parsed,
  }
}

const validateProofs = async (proofs: string[], delegate: string): Promise<{ validIssuer: boolean; validProofs: boolean }> => {
  const promisedValidations = await Promise.all(proofs.map(proof => validateProof(proof, delegate)))
  return promisedValidations.reduce(
    ({ validIssuer, validProofs }, validation) => ({
      validIssuer: validIssuer && validation.validIssuer,
      validProofs: validProofs && validation.validProof,
    }),
    { validIssuer: true, validProofs: true }
  )
}

const validateProof = async (proof: string, delegate: string): Promise<{ validIssuer: boolean; validProof: boolean }> => {
  const token = await decode(proof)

  let validProof: boolean = false

  if (token !== null) {
    try {
      await ucan.validate(proof)
      validProof = true
    } catch {
      validProof = false
    }
  }

  return {
    validIssuer: token?.payload.aud === delegate,
    validProof
  }
}
