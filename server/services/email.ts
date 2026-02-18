import { logger } from './logger';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const resolveFrontendBaseUrl = (): string => {
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
};

const getDefaultFromEmail = (): string => {
  return process.env.EMAIL_FROM || 'auth@saveastray.app';
};

const sendViaResend = async (payload: EmailPayload): Promise<boolean> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getDefaultFromEmail(),
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API request failed: ${response.status} ${body}`);
  }

  return true;
};

const logEmailPreview = (payload: EmailPayload): void => {
  logger.info('email_preview_logged', {
    to: payload.to,
    subject: payload.subject,
  });
};

export const sendTransactionalEmail = async (payload: EmailPayload): Promise<void> => {
  try {
    const delivered = await sendViaResend(payload);
    if (delivered) {
      logger.info('email_sent', {
        to: payload.to,
        subject: payload.subject,
      });
      return;
    }

    logEmailPreview(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown email error';
    logger.error('email_send_failed', {
      message,
      to: payload.to,
      subject: payload.subject,
    });
  }
};

export const buildEmailVerificationLink = (token: string): string => {
  const base = resolveFrontendBaseUrl();
  return `${base.replace(/\/$/, '')}/#/verify-email?token=${encodeURIComponent(token)}`;
};

export const buildPasswordResetLink = (token: string): string => {
  const base = resolveFrontendBaseUrl();
  return `${base.replace(/\/$/, '')}/#/reset-password?token=${encodeURIComponent(token)}`;
};

export const sendEmailVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationLink = buildEmailVerificationLink(token);

  await sendTransactionalEmail({
    to: email,
    subject: 'Verify your Save A Stray account',
    html: `<p>Welcome to Save A Stray.</p><p>Please verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link expires in 24 hours.</p>`,
    text: `Welcome to Save A Stray. Verify your email using this link: ${verificationLink}. This link expires in 24 hours.`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetLink = buildPasswordResetLink(token);

  await sendTransactionalEmail({
    to: email,
    subject: 'Reset your Save A Stray password',
    html: `<p>We received a request to reset your password.</p><p>Use this link to continue:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 60 minutes.</p>`,
    text: `We received a request to reset your password. Use this link: ${resetLink}. This link expires in 60 minutes.`,
  });
};
