import mongoose from "mongoose";

const projectCardSchema = new mongoose.Schema({
  title: String,
  thumbnail: String,
  shortDescription: String,
  category: String,
  gallery: [String],
  detailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectDetail"
  }
}, { timestamps: true });

const Project = mongoose.model("Project", projectCardSchema);

export default Project;