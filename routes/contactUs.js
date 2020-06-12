const express = require("express");
const { ContactUs, validate } = require("../models/contactUsMessages");
const auth = require("../middleware/auth");
const _ = require("lodash");
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: ContactUs
 *   description: ContactUs management
 */
/**
 * @swagger
 * /api/contact:
 *  get:
 *    description: Use to request all contacts
 *    summary:  Use to request all contacts
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg iscontact field in JWT.
 *    responses:
 *      '200':
 *        description: A successful response containg all contacts in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/", auth, async (req, res) => {
  const result = await ContactUs.find();
  res.json({ data: result });
});

// FIXME: problem in it
// getting undreadMessages by id
/**
 * @swagger
 * tags:
 *   name: ContactUs
 *   description: ContactUs management
 */
/**
 * @swagger
 * /api/contact/unreadMessages/{id}:
 *  get:
 *    description: get the unread message specified by an id
 *    summary:  use to request a single contact us message
 *    tags: [ContactUs]
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
/**
 * @swagger
 * tags:
 *   name: ContactUs
 *   description: ContactUs management
 */
/**
 * @swagger
 * /api/contact/me/{id}:
 *  get:
 *    description: Use to request a single contact
 *    summary:  Use to request a single contact
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg iscontact field in JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the contact to get.
 *    responses:
 *      '200':
 *        description: A successful response containg all contacts in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  const result = await ContactUs.findById(req.params.id);
  if (!result) res.status(400).json({ error: "Not Found" });
  else {
    res.json({ data: result });
  }
});

/**
 * @swagger
 * /api/contact/:
 *  post:
 *    description: use to post the new contact us message
 *    summary: use to post the new contact us message.
 *    tags: [ContactUs]
 *    parameters:
 *    - in: body
 *      name: message
 *      description: The message to save.
 *      schema:
 *        type: object
 *        required:
 *        - firstName
 *        - firstName
 *        - phoneNumber
 *        - email
 *        - message
 *        properties:
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *          phoneNumber:
 *            type: string
 *          email:
 *            type: string
 *          message:
 *            type: string
 *    responses:
 *      '200':
 *        description: success mesage in json formet indicating message has been forwarded...
 *      '400':
 *        description: message in json format indicating contact with email already exists.
 */
router.post("/", async (req, res) => {
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

// FIXME: problem in it
/**
 * @swagger
 * /api/contact/{id}:
 *  delete:
 *    description: Use to delete the message
 *    summary:  Use to delete the message
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: path
 *      name: id of the message
 *      type: string
 *      required: true
 *      description:  Object ID of the messgae to delete
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating  Message Deleted successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/:id", auth, async (req, res) => {
  const result = await ContactUs.findByIdAndRemove(req.params.id);
  res.json({ message: "Message Deleted successfully" });
});

// FIXME: status is not updating to true
/**
 * @swagger
 * /api/contact/{id}:
 *  put:
 *    description: Use to set the message status to read.
 *    summary:  Use to set the message status to read.
 *    tags: [ContactUs]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: path
 *      name: id of the message
 *      type: string
 *      required: true
 *      description:  Object ID of the messgae to set read
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating Message status set to read successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
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
  res.json({ message: "Message status set to read successfully" });
});

module.exports = router;
