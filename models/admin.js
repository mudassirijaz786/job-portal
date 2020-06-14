const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

// token generation
adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

// admin model
const Admin = mongoose.model("Admin", adminSchema);

validateAdmin = (admin) => {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().alphanum().min(8).max(32).required(),
  };
  return Joi.validate(admin, schema);
};

exports.Admin = Admin;
exports.validate = validateAdmin;
