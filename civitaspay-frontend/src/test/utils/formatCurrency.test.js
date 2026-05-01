import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatCurrency';

describe('formatCurrency', () => {
  it('formatea un número entero correctamente', () => {
    expect(formatCurrency(100000)).toContain('100,000');
  });

  it('formatea con decimales', () => {
    expect(formatCurrency(1234.56)).toContain('1,234.56');
  });

  it('formatea cero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('formatea números negativos', () => {
    expect(formatCurrency(-5000)).toContain('5,000');
  });

  it('incluye símbolo de moneda', () => {
    const resultado = formatCurrency(1000);
    expect(resultado).toMatch(/\$|MXN/);
  });
});

describe('formatCurrencyCompact', () => {
  it('formatea millones con sufijo', () => {
    const resultado = formatCurrencyCompact(1500000);
    expect(resultado).toMatch(/1\.5|1,5/);
  });

  it('formatea miles con sufijo', () => {
    const resultado = formatCurrencyCompact(50000);
    expect(resultado).toContain('50');
  });

  it('formatea cero', () => {
    expect(formatCurrencyCompact(0)).toContain('0');
  });
});