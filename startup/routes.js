const express = require("express");
const employees = require("../routes/employees");
const profiles = require("../routes/profiles");
const error = require("../middleware/error");

module.exports = (app) => {
  app.use(express.json());
  app.use("/api/employee", employees);
  app.use("/api/profile", profiles);

  app.use(error);
};
