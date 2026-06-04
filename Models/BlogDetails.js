import mongoose from "mongoose";


const blogDetailSchema = new mongoose.Schema({

  blogCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog"
  },

  content: String,

  author: String,

  tags: [String],

  gallery: [String],

  seoTitle: String,

  seoDescription: String,


  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const BlogDetail = mongoose.model("BlogDetail", blogDetailSchema);

export default BlogDetail;