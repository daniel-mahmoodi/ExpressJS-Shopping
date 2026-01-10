const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { Op } = require("sequelize");
const User = require("../models/user");

router.get("/", async (req, res) => {
  let queryObject = {};
  const { mobile, name } = req.query;

  if (mobile) {
    queryObject.mobile = { [Op.like]: `%${mobile}%` };
  }
  if (name) {
    queryObject.name = { [Op.like]: `%${name}%` };
  }

  const currentPage = page ? page : 1;
  const limit = qty ? qty : 2;

  const users = await User.findAll({
    where: queryObject,
    limit: limit,
    offset: 2 * (currentPage - 1),
  });
  const count = await User.count({
    where: queryObject,
  });
  const lastPage = Math.ceil(count / limit);

  res.send({ users, count, lastPage });
});

router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404).send("user not found");
  }
  res.send(user);
});

router.delete("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404).send("user not found");
    return;
  }
  user.destroy();
  res.send(`user with ID ${user.id} deleted`);
});
router.use(express.json());
router.post("/", async (req, res) => {
  const { mobile, name, password } = req.body;
  const userSchema = Joi.object({
    mobile: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = userSchema.validate({
    mobile: mobile,
    name: name,
    password: password,
  });
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    const newBlog = await User.create({
      mobile: mobile,
      name: name,
      password: password,
    });

    res.status(201).send(newBlog);
  } catch (error) {
    let errorMessage = error.message;
    if (error.errors) {
      for (const item of error.errors) {
        errorMessage = errorMessage + `\n${item.message}`;
      }
    }
    res.status(400).send(errorMessage);
  }
});

router.put("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404).send("user not found");
    return;
  }
  const { mobile, name, password } = req.body;
  const userSchema = Joi.object({
    mobile: Joi.string(),
    name: Joi.string(),
    password: Joi.string(),
  });
  const { error } = userSchema.validate({
    mobile: mobile,
    name: name,
    password: password,
  });
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    await user.update({
      mobile: mobile,
      name: name,
      password: password,
    });

    res.status(201).send(user);
  } catch (error) {
    let errorMessage = error.message;
    if (error.errors) {
      for (const item of error.errors) {
        errorMessage = errorMessage + `\n${item.message}`;
      }
    }
    res.status(400).send(errorMessage);
  }
});
module.exports = router;
