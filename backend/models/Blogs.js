import mongoose from 'mongoose';

const blogsSchema = mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  category:{
    type:String,
    required:true,
  },
  description: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    required: true,
  },
  userOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  image: {
    data: String,
    contentType: String,
  },
});

export const BlogsModel = mongoose.model('Blogs', blogsSchema);
