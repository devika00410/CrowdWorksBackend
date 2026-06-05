import mongoose from "mongoose";


const serviceDetailSchema = new mongoose.Schema({

 serviceCardId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Service"
},

  bannerImage: String,

  longDescription: String,

  features: [String],

  gallery: [String],

}, { timestamps: true });



const ServiceDetail = mongoose.model("ServiceDetail", serviceDetailSchema);

export default ServiceDetail;