const express = require("express");
const { ContactUs, validate } = require("../models/contactUsMessages");
const auth = require("../middleware/auth");
const _ = require("lodash");
const router = express.Router();

// getting all messages
router.get("/", auth, async (req, res) => {
  const result = await ContactUs.find();
  res.json({ data: result });
});

// getting undreadMessages by id
router.get("/unreadMessages/:id", auth, async (req, res) => {
  const messages = await ContactUs.find({ status: true });
  res.json({ length: messages.length });
});

// getting message by id
router.get("/:id", auth, async (req, res) => {
  const result = await ContactUs.findById(req.params.id);
  if (!result) res.status(400).json({ error: "Not Found" });
  else {
    res.json({ data: result });
  }
});

// posting a new message
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const details = _.pick(req.body, [
    "firstName",
    "lastName",
    "message",
    "phoneNumber",
    "email",
  ]);

  const message = new ContactUs(details);
  const result = await message.save();

  res.json({ data: result });
});

// deleting message or contact us
router.delete("/:id", auth, async (req, res) => {
  const result = await ContactUs.findByIdAndRemove(req.params.id);
  res.send(result);
});

// FIXME: status is not updating to true
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
  res.json({ data: message });
});

module.exports = router;
