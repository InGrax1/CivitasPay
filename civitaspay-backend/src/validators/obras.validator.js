/**
 * Validadores Joi para Obras
 * Esquemas de validación para endpoints de obras
 */

const Joi = require('joi');

/**
 * Schema para crear obra
 */
const crearObraSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 200 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  codigo: Joi.string()
    .max(50)
    .allow(null, '')
    .optional(),
  
  cliente: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'El nombre del cliente es requerido',
      'string.min': 'El nombre del cliente debe tener al menos 3 caracteres',
      'any.required': 'El nombre del cliente es requerido'
    }),
  
  direccion: Joi.string()
    .allow(null, '')
    .optional(),
  
  fecha_inicio: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
      'any.required': 'La fecha de inicio es requerida'
    }),
  
  fecha_fin_estimada: Joi.date()
    .min(Joi.ref('fecha_inicio'))
    .allow(null)
    .optional()
    .messages({
      'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
    }),
  
  porcentaje_retencion: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .default(5)
    .messages({
      'number.min': 'El porcentaje de retención debe ser mayor o igual a 0',
      'number.max': 'El porcentaje de retención debe ser menor o igual a 100'
    }),
  
  porcentaje_materiales: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El porcentaje de materiales debe ser un número',
      'number.min': 'El porcentaje de materiales debe ser mayor o igual a 0',
      'number.max': 'El porcentaje de materiales debe ser menor o igual a 100',
      'any.required': 'El porcentaje de materiales es requerido'
    }),
  
  porcentaje_nomina: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El porcentaje de nómina debe ser un número',
      'number.min': 'El porcentaje de nómina debe ser mayor o igual a 0',
      'number.max': 'El porcentaje de nómina debe ser menor o igual a 100',
      'any.required': 'El porcentaje de nómina es requerido'
    }),
  
  porcentaje_herramienta: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El porcentaje de herramienta debe ser un número',
      'number.min': 'El porcentaje de herramienta debe ser mayor o igual a 0',
      'number.max': 'El porcentaje de herramienta debe ser menor o igual a 100',
      'any.required': 'El porcentaje de herramienta es requerido'
    }),
  
  residente_id: Joi.string()
    .length(36)
    .allow(null)
    .optional()
    .messages({
      'string.length': 'El ID del residente debe ser un UUID válido'
    }),
  
  estado: Joi.string()
    .valid('ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA')
    .default('ACTIVA')
    .messages({
      'any.only': 'El estado debe ser: ACTIVA, PAUSADA, FINALIZADA o CANCELADA'
    }),
  
  activa: Joi.boolean()
    .default(true)
    .optional()
});

/**
 * Schema para actualizar obra
 */
const actualizarObraSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  
  codigo: Joi.string()
    .max(50)
    .allow(null, '')
    .optional(),
  
  cliente: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  
  direccion: Joi.string()
    .allow(null, '')
    .optional(),
  
  fecha_inicio: Joi.date()
    .optional(),
  
  fecha_fin_estimada: Joi.date()
    .allow(null)
    .optional(),
  
  porcentaje_retencion: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional(),
  
  porcentaje_materiales: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional(),
  
  porcentaje_nomina: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional(),
  
  porcentaje_herramienta: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional(),
  
  residente_id: Joi.string()
    .length(36)
    .allow(null)
    .optional(),
  
  estado: Joi.string()
    .valid('ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA')
    .optional(),
  
  activa: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

module.exports = {
  crearObraSchema,
  actualizarObraSchema
};