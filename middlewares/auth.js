const Account = require("../models/account-model");

// check whether the user has been logged in or not
auth = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).send({ error: "Token Missing" });
  }

  Account.findByToken(token, (err, account) => {
    if (err) throw err;
    if (!account)
      return res.status(401).json({
        error: true,
        isAuth: false,
        message: "Cannot find the token",
      });

    req.token = token;
    req.authAccount = account;
    next();
  });
};

module.exports = auth;
