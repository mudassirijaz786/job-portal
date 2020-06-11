const express = require("express");
const employees = require("../routes/employees");
const profiles = require("../routes/profiles");
const companies = require("../routes/companies");
const admins = require("../routes/admins");

const error = require("../middleware/error");

module.exports = (app) => {
  app.use(express.json());
  app.use("/api/employee", employees);
  app.use("/api/profile", profiles);
  app.use("/api/company", companies);
  app.use("/api/admin", admins);

  app.use(error);
};
