const express = require("express");
const bodyParser = require("body-parser").json;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser());

require("./config/db");
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const UserRouter = require("./api/user");

app.use("/user", UserRouter);
