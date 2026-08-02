import { CALC_KEYS } from '../constants/types';

type CalcResult = {
  result: number | null;
  error: boolean;
};

const MAX_VALUE = 999999999.99;

const OP_CHARS = [
  CALC_KEYS.add,
  CALC_KEYS.subtract,
  CALC_KEYS.multiply,
  CALC_KEYS.divide,
].join('');

const precedence = (op: string) => (
  op === CALC_KEYS.add || op === CALC_KEYS.subtract ? 1 : 2
);

function tokenize(expr: string): (number | string)[] {
  const tokens: (number | string)[] = [];
  let num = '';
  for (const ch of expr) {
    if (ch === ' ') continue;
    if (OP_CHARS.includes(ch)) {
      if (num) {
        tokens.push(parseFloat(num));
        num = '';
      }
      tokens.push(ch);
    } else {
      num += ch;
    }
  }
  if (num) tokens.push(parseFloat(num));
  return tokens;
}

function applyOp(a: number, b: number, op: string): number {
  switch (op) {
    case CALC_KEYS.add: return a + b;
    case CALC_KEYS.subtract: return a - b;
    case CALC_KEYS.multiply: return a * b;
    case CALC_KEYS.divide: return b === 0 ? NaN : a / b;
    default: return 0;
  }
}

function evalTokens(tokens: (number | string)[]): number {
  const nums: number[] = [];
  const ops: string[] = [];

  const calcTop = () => {
    const b = nums.pop();
    const a = nums.pop();
    const op = ops.pop();
    if (a === undefined || b === undefined || op === undefined) return;
    nums.push(applyOp(a, b, op));
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (typeof t === 'number') {
      nums.push(t);
    } else {
      while (ops.length && precedence(ops[ops.length - 1]) >= precedence(t)) {
        calcTop();
      }
      ops.push(t);
    }
  }
  while (ops.length) calcTop();
  return nums[0];
}

export function evaluate(expression: string): CalcResult {
  if (!expression.trim()) return { result: null, error: true };

  const cleaned = expression.replace(/,/g, '.');
  const tokens = tokenize(cleaned);

  if (tokens.length === 0) return { result: null, error: true };

  // Validate: no consecutive operators, no trailing operator
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (typeof t === 'string') {
      if (i === 0 && t !== CALC_KEYS.subtract) return { result: null, error: true };
      if (i === tokens.length - 1) return { result: null, error: true };
      if (i > 0 && typeof tokens[i - 1] === 'string') return { result: null, error: true };
    }
  }

  try {
    const raw = evalTokens(tokens);
    if (isNaN(raw) || !isFinite(raw)) return { result: null, error: true };
    if (Math.abs(raw) > MAX_VALUE) return { result: null, error: true };
    const result = Math.round(raw * 100) / 100;
    return { result, error: false };
  } catch {
    return { result: null, error: true };
  }
}
