const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config").get(process.env.NODE_ENV);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false).connect(
  config.DATABASE,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (err) {
    if (err) {
      console.log("Error ==> ", err);
    } else {
      console.log("Database is connected");
    }
  }
);

// routes
const accountRouter = require("./routes/account-router");
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", accountRouter);

// listening port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
