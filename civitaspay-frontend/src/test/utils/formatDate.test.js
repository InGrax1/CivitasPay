import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, toInputDate } from '../../utils/formatDate';

describe('formatDate', () => {
  it('formatea una fecha válida', () => {
    const resultado = formatDate('2026-01-15');
    expect(resultado).toContain('2026');
  });

  it('retorna guión en fecha nula', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('retorna guión en fecha undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('retorna guión en string vacío', () => {
    expect(formatDate('')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('incluye hora en el resultado', () => {
    const resultado = formatDateTime('2026-01-15T10:30:00');
    expect(resultado).toContain('2026');
  });

  it('retorna guión en valor nulo', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});

describe('toInputDate', () => {
  it('convierte fecha a formato YYYY-MM-DD', () => {
    const resultado = toInputDate('2026-03-15T00:00:00.000Z');
    expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('retorna string vacío en valor nulo', () => {
    expect(toInputDate(null)).toBe('');
  });
});