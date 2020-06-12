const express = require("express");
const employees = require("../routes/employees");
const profiles = require("../routes/profiles");
const companies = require("../routes/companies");
const admins = require("../routes/admins");
const jobs = require("../routes/jobs");
const contactUs = require("../routes/contactUs");
const FAQs = require("../routes/FAQs");
const companyProfiles = require("../routes/companyProfiles");
const jobsApplied = require("../routes/jobsApplied");
const termsAndConditions = require("../routes/termsAndConditions");

const error = require("../middleware/error");

module.exports = (app) => {
  app.use(express.json());
  app.use("/api/employee", employees);
  app.use("/api/profile", profiles);
  app.use("/api/company", companies);
  app.use("/api/admin", admins);
  app.use("/api/job", jobs);
  app.use("/api/contact", contactUs);
  app.use("/api/jobsApplied", jobsApplied);
  app.use("/api/termsAndCondition", termsAndConditions);
  app.use("/api/companyProfile", companyProfiles);
  app.use("/api/faq", FAQs);

  app.use(error);
};
