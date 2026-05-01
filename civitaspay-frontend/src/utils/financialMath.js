export function calcularMontos(montoBruto, iva = 16) {
  const bruto = parseFloat(montoBruto) || 0;
  const factorIva = 1 + iva / 100;
  const base = bruto / factorIva;
  const ivaCalc = bruto - base;
  return { bruto, base, iva: ivaCalc };
}

export function calcularDistribucion(costoDirecto, obra) {
  const cd = parseFloat(costoDirecto) || 0;
  return {
    materiales:  cd * ((obra.porcentaje_materiales  ?? 0) / 100),
    nomina:      cd * ((obra.porcentaje_nomina       ?? 0) / 100),
    herramienta: cd * ((obra.porcentaje_herramienta  ?? 0) / 100),
  };
}

export function calcularTodo(montoBruto, iva = 16, obra = {}) {
  const { bruto, base, iva: ivaCalc } = calcularMontos(montoBruto, iva);
  const retencion    = base * ((obra.porcentaje_retencion ?? 0) / 100);
  const costoDirecto = base - retencion;
  const distribucion = calcularDistribucion(costoDirecto, obra);

  return {
    bruto,
    base,
    iva:         ivaCalc,
    retencion,
    costoDirecto,
    ...distribucion,
  };
}