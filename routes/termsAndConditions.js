const auth = require("../middleware/auth");
const _ = require("lodash");
const { TAC } = require("../models/termsAndConditions");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const tac = await TAC.find();
  res.send(tac);
});
router.get("/:id", async (req, res) => {
  const tac = await TAC.findById(req.params.id);
  res.send(tac);
});
router.post("/", async (req, res) => {
  const tac = new TAC(_.pick(req.body, ["description"]));
  await tac.save();
  res.json({ message: "termsAndCondition has been saved successfully" });
});

// FIXME: updation not working
router.put("/:id", async (req, res) => {
  const description = req.body.description;
  const tac = await TAC.findByIdAndUpdate(
    req.params.id,
    { $set: description },
    { new: true }
  );
  res.json({ message: "termsAndCondition has been updated and successfully" });
});

router.delete("/:id", async (req, res) => {
  const tac = await TAC.findByIdAndRemove(req.params.id);
  res.json({ message: "termsAndCondition has been deleted successfully" });
});
module.exports = router;
