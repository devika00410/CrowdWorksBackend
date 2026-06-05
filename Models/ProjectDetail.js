import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  subtitle: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
});

const projectDetailSchema = new mongoose.Schema(
  {
    projectCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project card reference is required"],
    },

    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    sections: [sectionSchema],

    gallery: [
      {
        url: { type: String, trim: true },
        caption: { type: String, trim: true },
      }
    ],
  },
  { timestamps: true }
);

const ProjectDetail = mongoose.model("ProjectDetail", projectDetailSchema);

export default ProjectDetail;