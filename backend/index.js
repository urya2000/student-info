const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = 8888;

const userRouter = require("./router/UserRouter");
const TaskRouter = require("./router/TaskRouter");

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", userRouter);
app.use("/api", TaskRouter);

mongoose
  .connect(
    "mongodb+srv://mabinaya2112:eirMqt43N169P1AM@cluster0.a8vdf5i.mongodb.net/InternInfoWeb"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDb is Not Connected : " + err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
