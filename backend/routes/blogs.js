import express from "express";
import mongoose from "mongoose";
import { UserModel } from "../models/Users.js";
import { BlogsModel } from "../models/Blogs.js";
import multer from "multer";
import crypto from "crypto"; // Import crypto module
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads", // Change this to your desired storage directory
  filename: (req, file, callback) => {
    const uniqueSuffix = crypto.randomBytes(5).toString("hex");
    callback(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.get("/unapproved", async (req, res) => {
  try {
    const unapprovedBlogs = await BlogsModel.find({ approved: false });
    res.status(200).json(unapprovedBlogs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ... existing code ...

router.get("/:id", async (req, res) => {
  console.log("hello");
  try {
    const { id } = req.params;
    const blog = await BlogsModel.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    console.log(blog);
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ... existing code ...

router.get("/", async (req, res) => {
  try {
    const result = await BlogsModel.find({ approved: true });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  const { heading, description, userOwner, category } = req.body;
  const approved = false;

  try {
    let imageFilename = null;

    if (req.file) {
      imageFilename = req.file.filename;
    }

    const blog = new BlogsModel({
      _id: new mongoose.Types.ObjectId(),
      heading,
      description,
      approved,
      userOwner,
      category,
      image: { data: imageFilename }, // Store the filename in the 'data' property
    });

    const result = await blog.save();

    await UserModel.findByIdAndUpdate(
      userOwner,
      { $push: { postedBlogs: result._id } },
      { new: true }
    );

    res.status(201).json({
      createdBlog: {
        heading: result.heading,
        description: result.description,
        approved: result.approved,
        _id: result._id,
        image: result.image,
        category: result.category,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBlog = await BlogsModel.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully", deletedBlog });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlog = await BlogsModel.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res
      .status(200)
      .json({ message: "Blog approved successfully", updatedBlog });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as blogsRouter };
