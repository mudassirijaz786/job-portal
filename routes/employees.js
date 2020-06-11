const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Employee, validate } = require("../models/employee");
const { Profile } = require("../models/profile");
const router = express.Router();
const Joi = require("joi");
const sendEmailForResetPassword = require("../utils/emailService");

// getting current employee
router.get("/me", auth, async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
  const employee = await Employee.findById(decoded._id).select("-password ");
  res.json({ currentEmployee: employee });
});

// login
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

// register

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let employee = await Employee.findOne({ email: req.body.email });
  if (employee)
    return res.status(400).json({
      error: `Employee with email ${req.body.email} is already registered`,
    });

  employee = new Employee(
    _.pick(req.body, ["name", "email", "password", "phoneNumber"])
  );
  const salt = await bcrypt.genSalt(10);
  employee.password = await bcrypt.hash(employee.password, salt);
  await employee.save();
  const profile = new Profile({
    employee_id: employee._id,
    projects: [],
    experiences: [],
    educations: [],
    languages: [],
    skills: [],
  });
  await profile.save();
  const token = employee.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(employee, ["_id", "name", "email"]));
});

// new password after resetting
router.post("/resetPassword/newPassword", async (req, res) => {
  const employeeId = await Employee.findById(req.body._id);
  if (!employeeId) {
    res.status(400).json({ message: "Invalid id" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.newPassword, salt);
    const employee = await Employee.findByIdAndUpdate(
      req.body._id,
      {
        $set: {
          password,
        },
      },
      { new: true }
    );
    const token = employee.generateAuthToken();
    res.json({ token });
  }
});

// sending email on password reset
router.post("/resetPassword/sendEmail", async (req, res) => {
  const email = req.body.email;
  const employee = await Employee.findOne({ email });
  console.log(employee);
  if (!employee) {
    res.status(400).json({ message: "Invalid email" });
  } else {
    sendEmailForResetPassword(
      email,
      "Reset Your password",
      "follow the link to generate code ",
      employee._id
    );
  }
  res.json({ message: "An email with the link has been forwarded to you.." });
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
