import { generateRandomString, isWithinExpiration } from "lucia/utils"
import {
  deleteEmailVerificationTokens,
  getEmailVerificationToken,
  getEmailVerificationTokens,
  getPasswordResetTokens,
  retrievePasswordResetToken,
  saveEmailVerificationToken,
  savePasswordResetToken,
} from "~/db"

const EXPIRES_IN = 1000 * 60 * 60 * 2 // 2 hours

export const generateEmailVerificationToken = async (userId: string) => {
  const storedTokens = await getEmailVerificationTokens(userId)
  if (storedTokens.length > 0) {
    const reusableStoredToken = storedTokens.find((token) =>
      isWithinExpiration(token.expires.getTime() - EXPIRES_IN / 2),
    )
    if (reusableStoredToken) return reusableStoredToken.id
  }
  const token = generateRandomString(63)
  await saveEmailVerificationToken(userId, token, EXPIRES_IN)

  return token
}

export const validateEmailVerificationToken = async (token: string) => {
  const storedToken = await getEmailVerificationToken(token)
  if (!storedToken) {
    throw new Error("Invalid token")
  } else {
    await deleteEmailVerificationTokens(storedToken.userId)
  }
  const tokenExpires = storedToken.expires.getTime()
  if (!isWithinExpiration(tokenExpires)) {
    throw new Error("Expired token")
  }
  return storedToken.userId
}

export const generatePasswordResetToken = async (userId: string) => {
  const storedUserTokens = await getPasswordResetTokens(userId)
  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      // check if expiration is within 1 hour
      // and reuse the token if true
      return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2)
    })
    if (reusableStoredToken) return reusableStoredToken.id
  }
  const token = generateRandomString(63)
  console.log(`${token}`)
  await savePasswordResetToken(token, new Date().getTime() + EXPIRES_IN, userId)

  return token
}

export const validatePasswordResetToken = async (token: string) => {
  const storedToken = await retrievePasswordResetToken(token)
  const tokenExpires = Number(storedToken.expires)
  if (!isWithinExpiration(tokenExpires)) {
    throw new Error("Expired token")
  }
  return storedToken.userId
}
