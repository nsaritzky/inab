import { generateRandomString, isWithinExpiration } from "lucia/utils"
import {
  deleteEmailVerificationTokens,
  getEmailVerificationToken,
  getEmailVerificationTokens,
  saveEmailVerificationToken,
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
