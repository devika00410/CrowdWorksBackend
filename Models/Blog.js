import mongoose from "mongoose";


const blogCardSchema = new mongoose.Schema({

  title: String,

  excerpt: String,

  coverImage: String,

  category: String,

  publishedAt: Date,

  detailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogDetail"
  }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;