require("dotenv").config();
const express = require("express");
const app = express();
const Joi = require("joi");
const database = require("./database");
const Blog = require("./models/blog");
const Category = require("./models/category");
const User = require("./models/user");
const blogs = require("./routers/blogs");
const categories = require("./routers/categories");
const users = require("./routers/users");
const helmet = require("helmet");
app.use(express.json());
app.use(express.static("public"));
app.use(helmet());
app.use("/blogs", blogs);
app.use("/categories", categories);
app.use("/users", users);
// app.get("*", (req, res) => {
//   res.status(404).send("Page not found");
// });
app.use((req, res) => {
  res.status(404).send("Page not found");
});
Blog.belongsTo(Category);
Category.hasMany(Blog);
const startServer = async () => {
  try {
    // await database.sync({ force: true });
    await database.sync();
    app.listen(3000);
    // await database.authenticate();
    console.log("*******Database connection established successfully.********");
  } catch (error) {
    console.error(
      "?????????????????????????Unable to connect to the database:?????????????",
      error,
    );
  }
};

startServer();
