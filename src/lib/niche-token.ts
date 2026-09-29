import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Encripta el código del nicho para usarlo en la URL pública (/n/[token]).
 *
 * Sin esto, cualquiera podría cambiar "A-104" por "A-105" en la barra de
 * direcciones y ver otro nicho sin haber escaneado su QR. Al viajar
 * encriptado, un token solo es válido para el nicho con el que se generó:
 * no hay forma de adivinar o fabricar el de otro nicho sin la clave del
 * servidor.
 */

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function key(): Buffer {
  const secret = process.env.NICHE_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "Falta NICHE_TOKEN_SECRET. Generá una con: openssl rand -base64 32"
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encodeNicheToken(code: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

/** Devuelve null ante cualquier token inválido, manipulado o de otra clave. */
export function decodeNicheToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const iv = raw.subarray(0, IV_LENGTH);
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    return null;
  }
}
