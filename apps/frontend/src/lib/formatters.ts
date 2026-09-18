/**
 * Utilitários de formatação para moeda e datas com padrão brasileiro.
 */

export function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function calculateTenure(startedAtString: string): {
  displayText: string;
  totalMonths: number;
} {
  const startedAt = new Date(startedAtString);
  const now = new Date();

  let months =
    (now.getFullYear() - startedAt.getFullYear()) * 12 + (now.getMonth() - startedAt.getMonth());

  if (months < 0) {
    months = 0;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let timeString = "";
  if (years > 0) {
    timeString = `${years} ${years === 1 ? "ano" : "anos"}`;
    if (remainingMonths > 0) {
      timeString += ` e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
    }
  } else if (months > 0) {
    timeString = `${months} ${months === 1 ? "mês" : "meses"}`;
  } else {
    timeString = "Recente (< 1 mês)";
  }

  const startFormatted = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(startedAt);

  return {
    displayText: `Cliente há ${timeString} (desde ${startFormatted})`,
    totalMonths: months,
  };
}
