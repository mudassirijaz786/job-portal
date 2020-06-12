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
// getting an unread messages
/**
 * @swagger
 * /api/contact/unreadMessages/{id}:
 *  get:
 *    description: get the unread message specified by an id
 *    summary:  use to request a single contact us message
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the message to read.
 *    responses:
 *      '200':
 *        description: A successful response containg a contact us message in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/unreadMessages/:id", auth, async (req, res) => {
  const messages = await ContactUs.find({ status: true });
  res.json({ length: messages.length });
});

// getting message by id
// getting a message
/**
 * @swagger
 * /api/contact/{id}:
 *  get:
 *    description: get the contact us specified by an id
 *    summary:  use to request a single contact us message
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the message to get.
 *    responses:
 *      '200':
 *        description: A successful response containg a contact us message in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
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
// deletion
/**
 * @swagger
 * /api/contact/{id}:
 *  delete:
 *    description: use to delete a contact us message
 *    summary: it enable to delete a message
 *    parameters:
 *    - in: body
 *      name: contact
 *      description: The contact to delete.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the remove a contact us message
 *    responses:
 *      '200':
 *        description: A successful response after deletion of contact us message in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
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
