const router = require("express").Router();
const Employee = require("../models/employee");
router.get("/", async (req, res) => {
  const emps = await Employee.find();
  res.send(emps);
});

module.exports = router;
