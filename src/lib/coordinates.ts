/**
 * Lectura de un par de coordenadas escrito en un solo campo, tal como lo copia
 * Google Maps: "-34.85811830377287, -56.228549851457004".
 *
 * Se guarda en dos columnas separadas, pero se pide en uno solo porque así es
 * como llega desde el mapa: pegar es una acción, transcribir dos números es
 * una oportunidad de equivocarse.
 */

export type Coordinates = { latitude: number; longitude: number };

export type CoordinatesResult =
  | { ok: true; value: Coordinates | null }
  | { ok: false; error: string };

/** Formato para mostrar en el campo al reabrir la ficha. */
export function formatCoordinates(
  latitude: number | null,
  longitude: number | null
): string {
  if (latitude === null || longitude === null) return "";
  return `${latitude}, ${longitude}`;
}

/**
 * Acepta separación por coma, por punto y coma o solo por espacios, y tolera
 * los paréntesis con que algunos sitios envuelven el par. Vacío significa "sin
 * ubicación", que es distinto de un error: permite borrar unas coordenadas
 * cargadas antes.
 */
export function parseCoordinates(input: string | null): CoordinatesResult {
  const raw = input?.trim() ?? "";
  if (raw === "") return { ok: true, value: null };

  const cleaned = raw.replace(/^\(|\)$/g, "").trim();
  const parts = cleaned
    .split(/\s*[,;]\s*|\s+/)
    .map((p) => p.trim())
    .filter((p) => p !== "");

  if (parts.length !== 2) {
    return {
      ok: false,
      error:
        'Escribí latitud y longitud separadas por coma, como las copia Google Maps: "-34.858118, -56.228550".',
    };
  }

  const [lat, lng] = parts.map(Number);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      ok: false,
      error:
        'Las coordenadas deben ser dos números. Usá punto decimal, no coma: "-34.858118, -56.228550".',
    };
  }

  // Fuera de rango casi siempre significa el par invertido o un dato pegado de
  // otro lado; guardarlo pondría el marcador en cualquier parte.
  if (lat < -90 || lat > 90) {
    return {
      ok: false,
      error: `La latitud debe estar entre -90 y 90 (recibí ${lat}). ¿Están al revés?`,
    };
  }
  if (lng < -180 || lng > 180) {
    return {
      ok: false,
      error: `La longitud debe estar entre -180 y 180 (recibí ${lng}).`,
    };
  }

  return { ok: true, value: { latitude: lat, longitude: lng } };
}
