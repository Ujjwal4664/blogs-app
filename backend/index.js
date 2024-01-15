import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/users.js";
import { blogsRouter } from "./routes/blogs.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth",userRouter)
app.use("/blogs", blogsRouter);
app.use('/uploads', express.static('uploads'));


mongoose.connect(
  "mongodb+srv://programjourney:programjourney@gameapp.rw1mwga.mongodb.net",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.listen(4000, () => console.log("Server started"));