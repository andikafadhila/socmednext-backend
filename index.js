require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
const { dbCon } = require("./src/connections");
const { authRoutes, postsRoutes, editRoutes } = require("./src/routes");

const logMiddleware = (req, res, next) => {
  console.log(req.method, req.url, new Date().toString());
  next();
};

app.use(
  cors({
    exposedHeaders: ["x-total-count", "x-token-access"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logMiddleware);
app.use(express.static("public"));

app.use("/auth", authRoutes);
app.use("/post", postsRoutes);
app.use("/edit", editRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .send("this is socialmedia app backend using MySQL as database");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
