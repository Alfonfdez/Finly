import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/utils/calculator';
import { CALC_KEYS } from '../../src/constants/types';

describe('evaluate', () => {
  it('returns an error for empty or whitespace-only expressions', () => {
    expect(evaluate('')).toEqual({ result: null, error: true });
    expect(evaluate('   ')).toEqual({ result: null, error: true });
  });

  it('evaluates basic addition and subtraction', () => {
    expect(evaluate('2+3')).toEqual({ result: 5, error: false });
    expect(evaluate('10-2')).toEqual({ result: 8, error: false });
  });

  it('respects operator precedence', () => {
    expect(evaluate('2+3*4')).toEqual({ result: 14, error: false });
    expect(evaluate('10-2*3')).toEqual({ result: 4, error: false });
    expect(evaluate('2*3+4')).toEqual({ result: 10, error: false });
  });

  it('handles division and multiplication', () => {
    expect(evaluate('10/4')).toEqual({ result: 2.5, error: false });
    expect(evaluate('2*3')).toEqual({ result: 6, error: false });
    expect(evaluate('100/2/2')).toEqual({ result: 25, error: false });
  });

  it('accepts commas as decimal separator', () => {
    expect(evaluate('2,5+1')).toEqual({ result: 3.5, error: false });
  });

  it('rounds floating point results to 2 decimals', () => {
    expect(evaluate('0.1+0.2')).toEqual({ result: 0.3, error: false });
    expect(evaluate('1/3')).toEqual({ result: 0.33, error: false });
  });

  it('returns an error for division by zero', () => {
    expect(evaluate('5/0')).toEqual({ result: null, error: true });
  });

  it('returns an error for a leading operator', () => {
    expect(evaluate('*5')).toEqual({ result: null, error: true });
    expect(evaluate('+2')).toEqual({ result: null, error: true });
  });

  it('returns an error for a trailing operator', () => {
    expect(evaluate('5+')).toEqual({ result: null, error: true });
    expect(evaluate('5*')).toEqual({ result: null, error: true });
  });

  it('returns an error for consecutive operators', () => {
    expect(evaluate('5++2')).toEqual({ result: null, error: true });
    expect(evaluate('5*-2')).toEqual({ result: null, error: true });
  });

  it('rejects results above the maximum value', () => {
    expect(evaluate('999999999.99+1')).toEqual({ result: null, error: true });
    expect(evaluate('999999999.99')).toEqual({ result: 999999999.99, error: false });
  });

  it('tolerates a trailing equals key (it is not an operator)', () => {
    expect(evaluate(`2+3${CALC_KEYS.equals}`)).toEqual({ result: 5, error: false });
  });
});
