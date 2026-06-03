
import mongoose from "mongoose";


const serviceCardSchema = new mongoose.Schema({
  title: String,

  shortDescription: String,

  thumbnail: String,

  icon: String,

  isActive: {
    type: Boolean,
    default: true
  },

  detailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceDetail"
  }
}, { timestamps: true });


const Service = mongoose.model("Service", serviceCardSchema);

export default Service;