export const formatBalance = (balance: number) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "COL",
  }).format(balance);
};
