const { model, Schema, SchemaTypes } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config").get(process.env.NODE_ENV);

const accountSchema = new Schema(
  {
    username: { type: String, required: true, index: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female"] },
    email: { type: String, required: true, index: true },
    password: { type: String, required: true },
    accessToken: String,
    refreshToken: String,
    createdBy: String,
    updatedBy: String,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true },
  { versionKey: false }
);

// hashing the account password before store into db (pre function)
accountSchema.pre("save", function (next) {
  let account = this;

  // Only run this function if password was moddified (not on other update functions)
  if (!account.isModified("password")) return next();

  bcrypt.genSalt(config.SALT, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(account.password, salt, function (err, hash) {
      if (err) return next(err);
      account.password = hash;
      next();
    });
  });
});

// check user logged in
accountSchema.methods.generateToken = function (cb) {
  let account = this;
  let accessToken = jwt.sign(account._id.toHexString(), config.ACCESS_TOKEN_PRIVATE_KEY);
  let refreshToken = jwt.sign(account._id.toHexString(), config.REFRESH_TOKEN_PRIVATE_KEY);

  account.accessToken = accessToken;
  account.refreshToken = refreshToken;

  account.save(function (err, account) {
    if (err) return cb(err);
    return cb(null, account);
  });
};

// find whether the account is logged-in or not
accountSchema.statics.findByToken = function (token, cb) {
  let account = this;

  jwt.verify(token, config.ACCESS_TOKEN_PRIVATE_KEY, function (err, decode) {
    account.findOne({ _id: decode, accessToken: token }, function (err, account) {
      if (err) return cb(err);
      return cb(null, account);
    });
  });
};

// refresh token
accountSchema.statics.findByRefreshToken = function (token, cb) {
  let account = this;

  jwt.verify(token, config.REFRESH_TOKEN_PRIVATE_KEY, function (err, decode) {
    account.findOne({ _id: decode, refreshToken: token }, function (err, account) {
      if (err) return cb(err);
      return cb(null, account);
    });
  });
};

// user login and check password
accountSchema.methods.comparePassword = function (password, cb) {
  // this.password is hashed password that stored in db
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(err);
    return cb(null, isMatch);
  });
};

module.exports = model("account", accountSchema);
