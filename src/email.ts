import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const hostname = "http://localhost:3000"
const access_key = process.env.SES_ACCESS_KEY!

const client = new SESClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: process.env.SES_SECRET_KEY!,
  },
})

const verificationEmailText = (link: string) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

        <h2 style="color: #333;">Email Verification</h2>

        <p>Hello,</p>

        <p>Thank you for signing up with Flite. To complete your registration, please click on the link below to verify your email address:</p>

        <p><a href="${link}" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>

        <p>If you did not create an account with us, please ignore this email. Your account will not be activated until you verify your email address.</p>

        <p>Best regards,<br>Flite</p>

    </div>

</body>

</html>
`

const passwordResetEmailText = (link: string) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

        <h2 style="color: #333;">Password Reset</h2>

        <p>Hello,</p>

        <p>We received a request to reset your password. To reset your password, click on the link below:</p>

        <p><a href="${link}" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>

        <p>If you did not request a password reset, please ignore this email. Your account is safe and no changes have been made.</p>

        <p>Best regards,<br>flite</p>

    </div>

</body>

</html>
`

const verificationEmailCommand = (email: string, token: string) =>
  new SendEmailCommand({
    Source: "nsaritzky@gmail.com",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Data: verificationEmailText(
            `https://localhost:3000/email-verification/${token}`,
          ),
        },
        Text: {
          Data: "This is a test message.",
        },
      },
      Subject: {
        Data: "Verify your account with Flite",
      },
    },
  })

const passwordResetEmailCommand = (email: string, token: string) =>
  new SendEmailCommand({
    Source: "nsaritzky@gmail.com",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Data: passwordResetEmailText(
            `https://localhost:3000/password-reset/${token}`,
          ),
        },
        Text: {
          Data: "This is a test message.",
        },
      },
      Subject: {
        Data: "Reset your flite password",
      },
    },
  })

export const sendValidationEmail = async (email: string, token: string) => {
  try {
    await client.send(verificationEmailCommand(email, token))
  } catch (e) {
    console.error(e)
    console.log(access_key)
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    await client.send(passwordResetEmailCommand(email, token))
  } catch (e) {
    console.error(e)
  }
}

export const validateEmail = (email: unknown) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
}
