const express = require("express");

const AccountCtrl = require("../controllers/account-ctrl");
const auth = require("../middlewares/auth");

const router = express.Router();

// authenticate
router.post("/authenticate", AccountCtrl.login);
router.put("/authenticate", AccountCtrl.updateAccessToken);
router.delete("/authenticate", auth, AccountCtrl.logout);

// account
router.get("/account", auth, AccountCtrl.getAccount);
router.post("/account", auth, AccountCtrl.createAccount);
router.get("/account/:id", auth, AccountCtrl.getAccount);
router.put("/account/:id", auth, AccountCtrl.updateAccount);
router.delete("/account/:id", auth, AccountCtrl.deleteAccount);

module.exports = router;
