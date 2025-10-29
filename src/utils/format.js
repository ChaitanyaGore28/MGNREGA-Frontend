export const fmtNum = (n) => {
  if (n === null || n === undefined || n === '-') return '-';
  return new Intl.NumberFormat('en-IN').format(n);
};
