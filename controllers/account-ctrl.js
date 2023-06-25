const Account = require("../models/account-model");

// bad request
function status400(res, errorMessage) {
  return res.status(400).json({ success: false, error: errorMessage });
}

// not found
function status404(res, errorMessage) {
  return res.status(404).json({ success: false, error: errorMessage });
}

function returnItems(accounts) {
  let items = [];
  accounts = accounts.length ? accounts : [accounts];
  accounts.forEach((account) => {
    items.push({
      id: account._id,
      username: account.username,
      firstname: account.firstname,
      lastname: account.lastname,
      gender: account.gender,
      email: account.email,
      createdBy: account.createdBy,
      createdAt: account.createdAt,
      updatedBy: account.updatedBy,
      updatedAt: account.updatedAt,
    });
  });
  return items.length == 1 ? items[0] : items;
}

// API Category - Authentication
// POST - /api/authenticate
login = (req, res) => {
  const loginAccount = new Account(req.body);
  Account.findOne({ username: loginAccount.username }, function (err, account) {
    if (err) return status400(res, err);
    if (!account) return res.json({ success: false, message: "Login failed." });

    account.comparePassword(loginAccount.password, (err, isMatch) => {
      if (err) return status400(res, err);
      if (!isMatch) return res.json({ success: false, message: "Login failed" });

      account.generateToken((err, account) => {
        if (err) return status400(res, err);

        res.status(200).json({
          success: true,
          message: "Login successful.",
          id: account._id,
          accessToken: account.accessToken,
          refreshToken: account.refreshToken,
          item: returnItems(account),
        });
      });
    });
  });
};

// PUT - /api/authenticate
updateAccessToken = (req, res) => {
  const refreshToken = req.headers["x-access-token"];
  Account.findByRefreshToken(refreshToken, (err, account) => {
    if (err) throw err;
    if (!account) return status404(res, "No account found.");

    account.generateToken((err, account) => {
      if (err) return status400(res, err);

      res.status(200).json({
        success: true,
        message: "New accessToken generated.",
        accessToken: account.accessToken,
      });
    });
  });
};

// DELETE - /api/authenticate
logout = (req, res) => {
  req.authAccount.accessToken = "";
  req.authAccount.refreshToken = "";
  req.authAccount.save((err, account) => {
    if (err) return status400(res, err);
    return res.status(200).json({
      success: true,
      message: "Logout successful!",
    });
  });
};

// API Category - Account
// GET - /api/account
// GET - /api/account/{id}
getAccount = (req, res) => {
  const id = req.params.id;
  const query = id ? { _id: id } : {};

  Account.find(query, (err, accounts) => {
    if (err) return status400(res, err);

    if (!accounts.length) return status404(res, "No account found.");

    return res
      .status(200)
      .json({ success: true, items: returnItems(accounts), count: accounts.length });
  });
};

// POST - /api/account
createAccount = (req, res) => {
  let body = req.body;
  if (!body) return status400(res, "You must provide an account to create account.");

  let newAccount = new Account(body);
  if (!newAccount) return status400(res, "Account details are missing!");

  Account.findOne({ username: newAccount.username }, function (err, account) {
    if (err) return status404(res, err);
    if (account)
      return res.status(400).json({
        success: false,
        message: "This username is registered in the system.",
      });

    newAccount.createdBy = req.authAccount._id;
    newAccount.save((err, account) => {
      if (err) return status400(res, err);
      return res.status(200).json({
        success: true,
        message: "Register successful!",
        items: returnItems(account),
      });
    });
  });
};

// PUT - /api/account/{id}
updateAccount = (req, res) => {
  let id = req.params.id;
  let body = req.body;

  if (!id) return status400(res, "You must provide account id to update.");
  if (!body) return status400(res, "You must provide account data to update.");

  Account.findOne({ _id: id }, function (err, account) {
    if (err) return status400(res, err);
    if (!account) return status404(res, "No account found.");

    account.firstname = body.firstname;
    account.lastname = body.lastname;
    account.gender = body.gender;

    account.updatedBy = req.authAccount._id;
    account.save((err, account) => {
      if (err) return status400(res, err);
      return res.status(200).json({
        success: true,
        message: "Account update successful!",
        item: returnItems(account),
      });
    });
  });
};

// DELETE - /api/account/{id}
deleteAccount = (req, res) => {
  let id = req.params.id;
  if (!id) return status400(res, "You must provide account id to delete.");

  Account.findOneAndDelete({ _id: id }, function (err, account) {
    if (err) return status400(res, err);
    if (!account) return status404(res, "Account not found.");

    return res.status(200).json({ success: true, message: "Account deleted successful!" });
  });
};

module.exports = {
  // Authentication
  login,
  updateAccessToken,
  logout,
  // Account
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};
