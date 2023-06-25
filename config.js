const config = {
  production: {
    DATABASE: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    SALT: process.env.MONGODB_URI,
    ACCESS_TOKEN_PRIVATE_KEY: process.env.ACCESS_TOKEN_PRIVATE_KEY,
    REFRESH_TOKEN_PRIVATE_KEY: process.env.REFRESH_TOKEN_PRIVATE_KEY,
  },
  default: {
    DATABASE: "mongodb://127.0.0.1:27017/marvel_connect", // ==> local
    // DATABASE: "mongodb+srv://tankaixian0327:xian12172@marvelconnect.0iryz5w.mongodb.net/", // ==> cloud (altis) - singapore
    PORT: 3001,
    SALT: 10,
    ACCESS_TOKEN_PRIVATE_KEY: "access_token_private_key",
    REFRESH_TOKEN_PRIVATE_KEY: "refresh_token_private_key",
  },
};

exports.get = function get(env) {
  return config[env] || config.default;
};
