const express = require("express");
const { ContactUs } = require("../models/contactUsMessages");
const auth = require("../middleware/auth");
const _ = require("lodash");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const result = await ContactUs.find();
  res.send(result);
});

router.get("/unreadMessages/:id", auth, async (req, res) => {
  const messages = await ContactUs.find({ status: true });
  res.json({ length: messages.length });
});
router.get("/:id", auth, async (req, res) => {
  const result = await ContactUs.findById(req.params.id);
  if (!result) res.status(400).send("Not Found");
  else {
    res.send(result);
  }
});
router.post("/", auth, async (req, res) => {
  const details = _.pick(req.body, [
    "firstName",
    "lastName",
    "message",
    "phoneNumber",
    "email",
  ]);
  const message = new ContactUs(details);
  const result = await message.save();
  res.send(result);
});

router.delete("/:id", auth, async (req, res) => {
  const result = await ContactUs.findByIdAndRemove(req.params.id);
  res.send(result);
});

router.put("/read/:id", auth, async (req, res) => {
  const message = await ContactUs.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: true,
      },
    },
    { new: true }
  );
  res.send(message);
});

module.exports = router;
