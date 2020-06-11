const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
});

// token generation
adminSchema.methods.generateAuthToken = () => {
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
    // all validations goes here
  };

  return Joi.validate(admin, schema);
};

exports.Admin = Admin;
exports.validate = validateAdmin;
