const nodemailer = require("nodemailer");
const config = require("config");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tradebabapk@gmail.com",
    pass: "Pakistan888",
  },
});

module.exports = function sendEmailForResetPassword(to, subject, text, _id) {
  var mailOptions = {
    from: "tradebabapk@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: `<a href='${config.get(
      "frontEndURL"
    )}/?id=${_id}'>Reset Password</a>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log("Email sent: " + info.response);
      return true;
    }
  });
};
