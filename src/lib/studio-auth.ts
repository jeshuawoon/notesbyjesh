import { createHmac, timingSafeEqual } from "crypto";

export const STUDIO_SESSION_COOKIE = "notesbyjesh_studio";
export const STUDIO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type StudioAuthEnv = {
  NODE_ENV?: string;
  STUDIO_PASSWORD?: string;
};

export function isStudioPasswordConfigured(env: StudioAuthEnv) {
  return getStudioPassword(env) !== null;
}

export function canAccessStudio(env: StudioAuthEnv, sessionToken?: string, now = Date.now()) {
  if (canBypassStudioPassword(env)) {
    return true;
  }

  return verifyStudioSessionToken(env, sessionToken, now);
}

export function canBypassStudioPassword(env: StudioAuthEnv) {
  return env.NODE_ENV !== "production" && !isStudioPasswordConfigured(env);
}

export function verifyStudioPassword(env: StudioAuthEnv, password: string) {
  const configuredPassword = getStudioPassword(env);

  if (!configuredPassword) {
    return false;
  }

  return safeEqual(password, configuredPassword);
}

export function createStudioSessionToken(env: StudioAuthEnv, issuedAt = Date.now()) {
  const password = getStudioPassword(env);

  if (!password) {
    throw new Error("Studio password is not configured.");
  }

  const issuedAtValue = String(issuedAt);
  const signature = signStudioSession(password, issuedAtValue);

  return `v1.${issuedAtValue}.${signature}`;
}

export function verifyStudioSessionToken(env: StudioAuthEnv, token?: string, now = Date.now()) {
  const password = getStudioPassword(env);

  if (!password || !token) {
    return false;
  }

  const [version, issuedAtValue, signature] = token.split(".");
  const issuedAt = Number(issuedAtValue);

  if (version !== "v1" || !Number.isFinite(issuedAt) || !signature) {
    return false;
  }

  if (issuedAt > now || now - issuedAt > STUDIO_SESSION_MAX_AGE_SECONDS * 1_000) {
    return false;
  }

  return safeEqual(signature, signStudioSession(password, issuedAtValue));
}

function getStudioPassword(env: StudioAuthEnv) {
  const password = env.STUDIO_PASSWORD?.trim();

  return password ? password : null;
}

function signStudioSession(password: string, issuedAt: string) {
  return createHmac("sha256", password).update(`studio-session:${issuedAt}`).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
