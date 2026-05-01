import { describe, it, expect } from 'vitest';
import { calcularMontos, calcularDistribucion, calcularTodo } from '../../utils/financialMath';

const obraMock = {
  porcentaje_materiales:   60,
  porcentaje_nomina:       30,
  porcentaje_herramienta:  10,
  porcentaje_retencion:     5,
};

describe('calcularMontos', () => {
  it('calcula IVA correctamente al 16%', () => {
    const resultado = calcularMontos(116000, 16);
    expect(resultado.iva).toBeCloseTo(16000, 0);
  });

  it('calcula base correctamente', () => {
    const resultado = calcularMontos(116000, 16);
    expect(resultado.base).toBeCloseTo(100000, 0);
  });

  it('monto bruto cero da todo en cero', () => {
    const resultado = calcularMontos(0, 16);
    expect(resultado.base).toBe(0);
    expect(resultado.iva).toBe(0);
  });

  it('calcula con IVA 0%', () => {
    const resultado = calcularMontos(100000, 0);
    expect(resultado.base).toBeCloseTo(100000, 0);
    expect(resultado.iva).toBeCloseTo(0, 0);
  });
});

describe('calcularDistribucion', () => {
  it('distribuye costo directo a categorías correctamente', () => {
    const resultado = calcularDistribucion(100000, obraMock);
    expect(resultado.materiales).toBeCloseTo(60000, 0);
    expect(resultado.nomina).toBeCloseTo(30000, 0);
    expect(resultado.herramienta).toBeCloseTo(10000, 0);
  });

  it('la suma de categorías es igual al costo directo', () => {
    const costoDirecto = 95000;
    const resultado = calcularDistribucion(costoDirecto, obraMock);
    const suma = resultado.materiales + resultado.nomina + resultado.herramienta;
    expect(suma).toBeCloseTo(costoDirecto, 0);
  });
});

describe('calcularTodo', () => {
  it('retorna todos los campos esperados', () => {
    const resultado = calcularTodo(116000, 16, obraMock);
    expect(resultado).toHaveProperty('base');
    expect(resultado).toHaveProperty('iva');
    expect(resultado).toHaveProperty('retencion');
    expect(resultado).toHaveProperty('costoDirecto');
    expect(resultado).toHaveProperty('materiales');
    expect(resultado).toHaveProperty('nomina');
    expect(resultado).toHaveProperty('herramienta');
  });

  it('costo directo es base menos retención', () => {
    const resultado = calcularTodo(116000, 16, obraMock);
    const esperado = resultado.base - resultado.retencion;
    expect(resultado.costoDirecto).toBeCloseTo(esperado, 0);
  });

  it('retención es porcentaje de la base', () => {
    const resultado = calcularTodo(116000, 16, obraMock);
    const retencionEsperada = resultado.base * (obraMock.porcentaje_retencion / 100);
    expect(resultado.retencion).toBeCloseTo(retencionEsperada, 0);
  });
});