const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Employee, validate } = require("../models/employee");
const router = express.Router();
const Joi = require("joi");

// getting current employee
router.get("/me", auth, async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
  const employee = await Employee.findById(decoded._id).select(
    "-password -_id"
  );
  res.json({ currentEmployee: employee });
});

// login route
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let employee = await Employee.findOne({ email: req.body.email });
  if (!employee)
    return res.status(400).json({ error: "Invalid email or password." });

  const validPassword = await bcrypt.compare(
    req.body.password,
    employee.password
  );
  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password." });

  const token = employee.generateAuthToken();
  res.json({ token });
});

// register route
router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let employee = await Employee.findOne({ email: req.body.email });
  if (employee)
    return res.status(400).json({
      error: `Employee with email ${req.body.email} is already registered`,
    });

  employee = new Employee(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  employee.password = await bcrypt.hash(employee.password, salt);
  await employee.save();

  const token = employee.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(employee, ["_id", "name", "email"]));
});

// function to validate login params
validateLogin = (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(req, schema);
};

module.exports = router;
