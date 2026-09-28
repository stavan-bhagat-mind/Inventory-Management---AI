export const isPositiveInteger = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

export const isNonNegativeInteger = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 0;
};

export const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};
