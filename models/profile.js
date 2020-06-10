const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({});

const Profile = mongoose.model("Profile", profileSchema);

validateProfile = (profile) => {
  const schema = {
    // all validations here
  };

  return Joi.validate(profile, schema);
};

exports.Profile = Profile;
exports.validate = validateProfile;
