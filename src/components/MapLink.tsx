import { Map } from "lucide-react";

/**
 * Enlace a Google Maps en las coordenadas del lugar, para llegar caminando
 * dentro del cementerio.
 *
 * Usa el esquema oficial de URL de Maps (`api=1`), que en el teléfono abre la
 * aplicación si está instalada y en la computadora abre el sitio. Se apunta a
 * las coordenadas crudas y no a una búsqueda por nombre: una tumba no tiene
 * dirección postal, y buscar el nombre del cementerio dejaría a la persona en
 * el portón en vez de en el lugar.
 */
export function MapLink({
  latitude,
  longitude,
  label = "Cómo llegar",
  className,
}: {
  latitude: number | null;
  longitude: number | null;
  label?: string;
  className?: string;
}) {
  // Sin las dos coordenadas no hay nada que señalar. El 0 es una coordenada
  // válida, así que la comprobación es contra null, no contra "falsy".
  if (latitude === null || longitude === null) return null;

  const href = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Abrir en Google Maps: ${latitude}, ${longitude}`}
      className={
        className ??
        "inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      }
    >
      <Map size={15} />
      {label}
    </a>
  );
}
