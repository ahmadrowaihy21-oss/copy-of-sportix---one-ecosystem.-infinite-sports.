import { storagePut } from "./storage";

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedProfileImageMimeType = typeof allowedMimeTypes[number];

function hasExpectedSignature(bytes: Buffer, mimeType: AllowedProfileImageMimeType) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
}

export function validateProfileImagePayload(payload: { base64: string; mimeType: string }) {
  if (!allowedMimeTypes.includes(payload.mimeType as AllowedProfileImageMimeType)) throw new Error("Profile image must be a JPEG, PNG, or WebP file.");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload.base64)) throw new Error("Profile image data is invalid.");
  const bytes = Buffer.from(payload.base64, "base64");
  if (!bytes.length || bytes.length > MAX_PROFILE_IMAGE_BYTES) throw new Error("Profile image must be 2 MB or smaller.");
  const mimeType = payload.mimeType as AllowedProfileImageMimeType;
  if (!hasExpectedSignature(bytes, mimeType)) throw new Error("Profile image content does not match its file type.");
  return { bytes, mimeType };
}

export async function storePartnerProfileImage(accountId: number, payload: { base64: string; mimeType: string }) {
  const { bytes, mimeType } = validateProfileImagePayload(payload);
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";
  return storagePut(`partner-profiles/${accountId}/profile.${extension}`, bytes, mimeType);
}
