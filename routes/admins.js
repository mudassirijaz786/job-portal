const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Admin, validate } = require("../models/admin");
const router = express.Router();
const Joi = require("joi");

// getting current admin
router.get("/me/:id", auth, async (req, res) => {
  const admin = await Admin.findById(req.params.id).select("-password ");
  if (admin) {
    res.json({ data: admin });
  } else {
    res.status(400).json({ message: "Not Found!" });
  }
});

// login
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let admin = await Admin.findOne({ email: req.body.email });
  if (!admin)
    return res.status(400).json({ error: "Invalid email or password." });

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password." });

  const token = admin.generateAuthToken();
  res.json({ token });
});

// register
router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let admin = await Admin.findOne({ email: req.body.email });
  if (admin)
    return res.status(400).json({
      error: `Admin with email ${req.body.email} is already registered`,
    });

  admin = new Admin(_.pick(req.body, ["name", "password", "email"]));

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
  await admin.save();
  const token = admin.generateAuthToken();

  res.header("x-auth-token", token).json({ token });
});

// function to validate login params
validateLogin = (req) => {
  const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string()
      .regex(RegExp(passwordReg))
      .required()
      .options({
        language: {
          string: {
            regex: {
              base:
                "must contains 8 digits, one lower case, one upper case and one special character",
            },
          },
        },
      }),
  };

  return Joi.validate(req, schema);
};

module.exports = router;
