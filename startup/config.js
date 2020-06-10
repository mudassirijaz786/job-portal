const config = require("config");

<<<<<<< HEAD
module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
  //this is testing some xetup
=======
module.exports = () => {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
>>>>>>> c02ac90bf19c04189560372c0557fc464bf93794
};
