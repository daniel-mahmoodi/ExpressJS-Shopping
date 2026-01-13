const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { Op } = require("sequelize");
const Blog = require("../models/blog");
const Category = require("../models/category");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/blog/");
  },
  filename: (req, file, cb) => {
    const safeDate = new Date().toISOString().replace(/:/g, "-");
    cb(null, safeDate + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.get("/", async (req, res) => {
  let queryObject = {};
  const { title, categoryId, page, qty } = req.query;

  if (title) {
    queryObject.title = { [Op.like]: `%${title}%` };
  }
  if (categoryId) {
    queryObject.categoryId = categoryId;
  }
  const currentPage = page ? page : 1;
  const limit = qty ? qty : 2;

  const blogs = await Blog.findAll({
    where: queryObject,
    limit: limit,
    offset: 2 * (currentPage - 1),
  });
  const count = await Blog.count({
    where: queryObject,
  });
  const lastPage = Math.ceil(count / limit);

  res.send({ blogs, count, lastPage });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id, { include: Category });
  if (!blog) {
    res.status(404).send("blog not found");
  }
  res.send(blog);
});

router.delete("/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);

  if (!blog) {
    res.status(404).send("blog not found");
    return;
  }
  blog.destroy();
  res.send(`blog with ID ${blog.id} deleted`);
});
router.use(express.json());
router.post("/", upload.single("image"), async (req, res) => {

  const { filename } = req.file;
  if (!filename) {
    res.status(400).send(error.message);
    return;
  }
  const blogSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    image: Joi.string().required(),
    categoryId: Joi.string().required(),
  });
  const { error } = blogSchema.validate({
    title: title,
    content: content,
    image: filename,
    categoryId: categoryId,
  });
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    const newBlog = await Blog.create({
      title: title,
      content: content,
      categoryId: categoryId,
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

router.put("/:id", upload.single("image"), async (req, res) => {
  const { filename } = req.file;
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) {
    res.status(404).send("blog not found");
    return;
  }
  const { title, content, categoryId } = req.body;
  const blogSchema = Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    image: Joi.string(),
    categoryId: Joi.string(),
  });
  const { error } = blogSchema.validate({
    title: title,
    content: content,
    image: filename,
    categoryId: categoryId,
  });
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    await blog.update({
      title: title,
      content: content,
      categoryId: categoryId,
    });

    res.status(201).send(blog);
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
