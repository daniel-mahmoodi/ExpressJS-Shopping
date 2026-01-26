const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { Op, where } = require("sequelize");
const User = require("../models/user");
router.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  let queryObject = {};
  const { mobile, name } = req.query;

  if (mobile) {
    queryObject.mobile = { [Op.like]: `%${mobile}%` };
  }
  if (name) {
    queryObject.name = { [Op.like]: `%${name}%` };
  }

  // const currentPage = page ? page : 1;
  // const limit = qty ? qty : 2;

  const users = await User.findAll({
    // where: queryObject,
    // limit: limit,
    // offset: 2 * (currentPage - 1),
    // attributes: { exclude: [password] },
  });
  // const count = await User.count({
  //   where: queryObject,
  // });
  // const lastPage = Math.ceil(count / limit);

  res.send({ users});
});

router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [password] },
  });
  if (!user) {
    res.status(404).send("user not found");
  }
  res.send(user);
});

router.post("/signin", async (req, res) => {
  const { mobile, password } = req.body;
  const user = await User.findOne({ where: { mobile: mobile } });
  if (!user) {
    res.status(404).send("user not found");
    return;
  }
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(401).send("password is not correct");
    return;
  }
  const token = jwt.sign(
    { id: user.id, name: user.name, mobile: user.mobile },
    process.env.SECRET_KEY,
  );
  res.send(token);
});

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      mobile: mobile,
      name: name,
      password: hashedPassword,
    });
    const userNoPass = { ...newUser.toJSON(), password: null };
    res.status(201).send(userNoPass);
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      mobile: mobile,
      name: name,
      password: hashedPassword,
    });
    const userNoPass = { ...user.toJSON(), password: null };
    res.status(201).send(userNoPass);
  } catch (error) {
    let errorMessage = error.message;
    if (error.errors) {
      for (const item of error.errors) {
        errorMessage = errorMessage + `\n${item.message}`;
      }
    }
    res.status(400).send(errorMessage);
  }

  router.delete("/:id", async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      res.status(404).send("user not found");
      return;
    }
    user.destroy();
    res.send(`user with ID ${user.id} deleted`);
  });
});
module.exports = router;
