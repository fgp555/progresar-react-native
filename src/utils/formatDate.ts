export const formatDate = (dateString: any) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toISOString().split("T")[0]; // Devuelve solo la parte de la fecha
};

export const formatDateTimeColombia = (dateString: any) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  }).format(date);
};
