import { Int32 } from "mongodb";
import mongoose from "mongoose";

const commercialRentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    property_type: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    furnishing: {
      type: String,
      required: true,
    },
    area_size: {
      type: Number,
      required: true,
    },
    amenities_list: {
      type: [String], // Array of strings
      required: true,
    },
    images_list: {
      type: [String], // Array of strings
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dev_name: {
      type: String,
      required: true,
    },
    agent_name: {
      type: String,
      required: true,
    },
    agent_photo: {
      type: String,
      required: true,
    },
    agent_phone: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CommRent = mongoose.model("Commercial_Rent", commercialRentSchema);

export default CommRent;
