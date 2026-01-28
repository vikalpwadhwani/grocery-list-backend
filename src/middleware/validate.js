const Joi = require('joi');
const { sendBadRequest } = require('../utils/responseHandler');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return sendBadRequest(res, 'Validation failed', errors);
    }
    
    next();
  };
};

// Validation Schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  createList: Joi.object({
    name: Joi.string().min(1).max(100).required(),
  }),
  
  joinList: Joi.object({
    inviteCode: Joi.string().length(6).required(),
  }),
  
  createItem: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    quantity: Joi.number().integer().min(1).optional(),
    unit: Joi.string().max(50).optional().allow(null, ''),
  }),
  
  updateItem: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    quantity: Joi.number().integer().min(1).optional(),
    unit: Joi.string().max(50).optional().allow(null, ''),
    isChecked: Joi.boolean().optional(),
  }),
};

module.exports = { validate, schemas };