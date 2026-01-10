const express = require("express");
const router = express.Router();
const Joi = require("joi");

const Category = require("../models/category");
router.get("/", async (req, res) => {
  const categories = await Category.findAll();
  res.send(categories);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    res.status(404).send("category not found");
  }
  res.send(category);
});

router.delete("/:id", async (req, res) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    res.status(404).send("category not found");
    return;
  }
  category.destroy();
  res.send(`category with ID ${category.id} deleted`);
});
router.use(express.json());
router.post("/", async (req, res) => {
  const { title, content } = req.body;
  const categorySchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
  });
  const { error } = categorySchema.validate({
    title: title,
    content: content,
  });
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    const newCategory = await Category.create({
      title: title,
      content: content,
    });

    res.status(201).send(newCategory);
  } catch (error) {
    let errorMessage = error.message;
    for (const item of error.errors) {
      errorMessage = errorMessage + `\n${item.message}`;
    }
    res.status(400).send(errorMessage);
  }
});

router.put("/:id", async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    res.status(404).send("category not found");
    return;
  }
  const { title, content } = req.body;
  const categorySchema = Joi.object({
    title: Joi.string(),
    content: Joi.string(),
  });
  const { error } = categorySchema.validate({
    title: title,
    content: content,
  });
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    await category.update({
      title: title,
      content: content,
    });

    res.status(201).send(category);
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
