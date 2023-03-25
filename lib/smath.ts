import Decimal from 'decimal.js';

type Numeric = number | string | NumericResult;

interface NumericResult {
  toFixed(decimalPlaces?: number | undefined): string;
  toNumber(): number;
  toString(): string;
}

function reduce(reducer: (dec: Decimal, n: string) => Decimal) {
  return function (...args: Numeric[]): NumericResult {
    const [first, ...tail] = args.map((s) => s.toString());
    if (first == null)
      return {
        toString: Number.NaN.toString.bind(Number.NaN),
        toNumber: () => Number.NaN,
        toFixed: Number.NaN.toFixed.bind(Number.NaN),
      };
    return tail.reduce(reducer, new Decimal(first));
  };
}

export const add = reduce((n, r) => n.add(r));
export const sub = reduce((n, r) => n.sub(r));
export const multiply = reduce((n, r) => n.mul(r));
export const divide = reduce((n, r) => n.div(r));
