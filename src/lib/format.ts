import { differenceInYears, format } from "date-fns";
import { es } from "date-fns/locale";

export function fullName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function formatYear(date: Date | string | null | undefined) {
  if (!date) return null;
  return format(new Date(date), "yyyy");
}

export function formatLifespan(
  birthDate: Date | string | null | undefined,
  deathDate: Date | string | null | undefined
) {
  const birth = birthDate ? formatYear(birthDate) : null;
  const death = deathDate ? formatYear(deathDate) : null;
  if (birth && death) return `${birth} — ${death}`;
  if (birth) return `${birth} —`;
  if (death) return `— ${death}`;
  return null;
}

export function lifespanYears(
  birthDate: Date | string | null | undefined,
  deathDate: Date | string | null | undefined
) {
  if (!birthDate || !deathDate) return null;
  return differenceInYears(new Date(deathDate), new Date(birthDate));
}

export function formatFullDate(date: Date | string | null | undefined) {
  if (!date) return null;
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es });
}
