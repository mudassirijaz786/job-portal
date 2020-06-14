const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const admin = require("../middleware/admin");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Employee, validate } = require("../models/employee");
const { Profile } = require("../models/profile");
const router = express.Router();
const Joi = require("joi");
const sendEmailForResetPassword = require("../utils/emailService");
/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management
 */
// getting current employee
/**
 * @swagger
 * /api/employee/me/{id}:
 *  get:
 *    description+: Use to request the data of the employee
 *    summary: Gets a user by ID.
 *    tags: [Employee]
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg the info about that particular employee
 *      '404':
 *        description: message in json format indicating employee not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 *
 */
router.get("/me/:id", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select(
      "-password "
    );
    if (employee) {
      res.json({ data: employee });
    } else {
      res.status(404).json({ message: "Not Found!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// login
/**
 * @swagger
 * /api/employee/login:
 *  post:
 *    description: use to login employee into the system
 *    summary: login employee into the system using email and password.
 *    tags: [Employee]
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: jwt token for that particular user loged in.
 *      '400':
 *        description: message in json format Invalid email or password.
 */
router.post("/login", async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// register
/**
 * @swagger
 * /api/employee/register:
 *  post:
 *    description: use to resister employee into the system
 *    summary: use to resister employee into the system.
 *    tags: [Employee]
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
 *        - phoneNumber
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          phoneNumber:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: jwt token for that particular  new emoloyee.
 *      '400':
 *        description: message in json format indicating errors
 *      '401':
 *        description: message in json format indicating admin with email already exists.
 */
router.post("/register", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let employee = await Employee.findOne({ email: req.body.email });
    if (employee)
      return res.status(401).json({
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
      .send(_.pick(employee, ["_id", "name", "email", "phoneNumber"]));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// new password after resetting

/**
 * @swagger
 * /api/employee/resetPassword/newPassword:
 *  post:
 *    description: use to reset the password after clicked on the link
 *    summary: use to reset the password after clicked on the link
 *    tags: [Employee]
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: jwt token for that particular emoloyee.
 *      '404':
 *        description: message in json format indicating Invalid id.
 */
router.post("/resetPassword/newPassword", async (req, res) => {
  try {
    const employeeId = await Employee.findById(req.body._id);
    if (!employeeId) {
      res.status(404).json({
        message: `Employee not found in system`,
      });
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
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// sending email on password reset
/**
 * @swagger
 * /api/employee/resetPassword/sendEmail:
 *  post:
 *    description: use to sending email on password reset
 *    summary: use to sending email on password reset
 *    tags: [Employee]
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: message in json formet indicating An email with the link has been forwarded to you.
 *      '400':
 *        description: message in json format indicating Invalid email.
 */
router.post("/resetPassword/sendEmail", async (req, res) => {
  try {
    const email = req.body.email;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      res.status(404).json({
        message: `Employee with an id ${req.body.email} not found in system`,
      });
    } else {
      sendEmailForResetPassword(
        email,
        "Reset Your password",
        "Follow the link to generate code ",
        employee._id
      );
    }
    res.json({ message: "An email with the link has been forwarded to you" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// deleting an employee
/**
 * @swagger
 * /api/employee/employeeRemove/{id}:
 *  delete:
 *    description: use to delete an employee
 *    summary: use to delete an employee
 *    tags: [Employee]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the employee to delete
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: message in json formet indicating the employee has been deleted.
 *      '404':
 *        description: message in json format indicating employee not found
 */
router.delete("/employeeRemove/:id", admin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndRemove(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    } else {
      res.json({ message: "Employee has been deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// searching an employee
/**
 * @swagger
 * /api/employee/searchEmployee/{id}:
 *  get:
 *    description: use to search an employee
 *    summary: use to search an employee by name
 *    tags: [Employee]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: name which is use to search an employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: message in json formet containing employee matched with query
 *      '400':
 *        description: message in json format indicating not found as an empty array
 */
router.get("/searchEmployee/:id", admin, async (req, res) => {
  try {
    const employees = await Employee.find();
    const query = req.params.id.toLowerCase();
    var foundedEmployee = [];
    employees.forEach((employee) => {
      if (employee.name.toLowerCase().includes(query)) {
        foundedEmployee.push(employee);
      }
    });
    res.json({ data: foundedEmployee });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// updating an employee
/**
 * @swagger
 * /api/employee/employeeUpdate/{id}:
 *  put:
 *    description: use to update a employee
 *    summary: use to update a employee into system
 *    tags: [Employee]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: employee_id to update it
 *    - in: body
 *      name: Job
 *      description: The employee to update.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        - password
 *        - name
 *        - phoneNumber
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          phoneNumber:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: a successful message saying faq has been posted
 *      '404':
 *        description: message contains not found ID
 */

router.put("/employeeUpdate/:id", auth, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Employee.findById(req.params.id);
    if (!found) {
      res.status(404).json({ message: "Invalid id. employee not found" });
    } else {
      const employees = await Employee.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.json({
        message: "employee has been updateed successfully",
        data: employees,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/employee/employeeBlocking/{id}:
 *  post:
 *    description: use to block an employee
 *    summary: use to block an employee, admin can do it
 *    tags: [Employee]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: employee_id which is use to block an employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: message in json formet containing blocked employee
 *      '404':
 *        description: message in json format indicating not found
 */

router.post("/employeeBlocking/:id", admin, async (req, res) => {
  try {
    const employee = await Employee.findById({ _id: req.params.id });
    if (!employee) {
      res.status(404).json({ message: `Employee not found` });
    } else {
      await Employee.updateOne(
        { _id: req.params.id },
        { $set: { blocked: true } },
        { new: true }
      );
      res.json({ message: `${employee.name} is blocked` });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// function to validate login params
validateLogin = (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().alphanum().min(8).max(32).required(),
  };

  return Joi.validate(req, schema);
};

module.exports = router;
