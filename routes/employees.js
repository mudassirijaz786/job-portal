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
/**
 * @swagger
 * /api/employee/me/{id}:
 *  get:
 *    description: Use to request the data of the employee
 *    summary: Gets a user by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the employee to get.
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: A successful response containg the info about that particular employee
 *      '400':
 *        description: message in json format indicating employee not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 *
 */
router.get("/me/:id", auth, async (req, res) => {
  const employee = await Employee.findById(req.params.id).select("-password ");
  if (employee) {
    res.json({ data: employee });
  } else {
    res.status(400).json({ message: "Not Found!" });
  }
});

// login
/**
 * @swagger
 * /api/employee/login:
 *  post:
 *    description: use to login employee into the system
 *    summary: login employee into the system using email and password.
 *    parameters:
 *    - in: body
 *      name: user
 *      description: The user to login.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        - password
 *        properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      '200':
 *        description: jwt token for that particular user loged in.
 *      '400':
 *        description: message in json format Invalid email or password.
 */
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let employee = await Employee.findOne({ email: req.body.email });
  if (!employee)
    return res.status(400).json({ message: "Invalid email or password." });

  const validPassword = await bcrypt.compare(
    req.body.password,
    employee.password
  );
  if (!validPassword)
    return res.status(400).json({ message: "Invalid email or password." });

  const token = employee.generateAuthToken();
  res.json({ token });
});

// register
/**
 * @swagger
 * /api/employee/register:
 *  post:
 *    description: use to resister employee into the system
 *    summary: use to resister employee into the system.
 *    parameters:
 *    - in: body
 *      name: user
 *      description: The employee to register.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        - password
 *        - name
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      '200':
 *        description: jwt token for that particular  new emoloyee.
 *      '400':
 *        description: message in json format indicating admin with email already exists.
 */
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

/**
 * @swagger
 * /api/employee  /resetPassword/newPassword:
 *  post:
 *    description: use to reset the password after clicked on the link
 *    summary: use to reset the password after clicked on the link
 *    parameters:
 *    - in: body
 *      name: user
 *      description: user details.
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        - newPassword
 *        properties:
 *          _id:
 *            type: string
 *          newPassword:
 *            type: string
 *    responses:
 *      '200':
 *        description: jwt token for that particular emoloyee.
 *      '400':
 *        description: message in json format indicating Invalid id.
 */
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
/**
 * @swagger
 * /api/employee/resetPassword/sendEmail:
 *  post:
 *    description: use to sending email on password reset
 *    summary: use to sending email on password reset
 *    parameters:
 *    - in: body
 *      name: user
 *      description: To send link for reset password on the email.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        properties:
 *         email:
 *            type: string
 *    responses:
 *      '200':
 *        description: message in json formet indicating An email with the link has been forwarded to you.
 *      '400':
 *        description: message in json format indicating Invalid email.
 */
router.post("/resetPassword/sendEmail", async (req, res) => {
  const email = req.body.email;
  const employee = await Employee.findOne({ email });
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

  res.json({ message: "An email with the link has been forwarded to you" });
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
