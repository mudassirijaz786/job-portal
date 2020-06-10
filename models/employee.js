const mongoose = require("mongoose");
const Joi = require("joi");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile_number: {
    type: String,
    required: true,
  },
});

function validateEmployee(emp) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
  };
  return Joi.validate(emp, schema);
}
const Employee = mongoose.model("employee", schema);

exports.Employee = Employee;
exports.validateEmployee = validateEmployee;
