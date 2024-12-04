import mongoose from "mongoose";

const residentialRentSchema = new mongoose.Schema(
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
    area_size: {
      type: Number,
      required: true,
    },
    floor_level: {
      type: String,
      required: true,
    },
    furnishing: {
      type: String,
      required: true,
    },
    facing: {
      type: String,
      required: true,
    },
    built_year: {
      type: String,
      required: true,
    },
    tenure: {
      type: String,
    },
    mrt: {
      type: String,
    },
    beds: {
      type: String,
    },
    bathrooms: {
      type: String,
    },
    dev_name: {
      type: String,
    },
    unit_types: {
      type: String,
    },
    total_units: {
      type: String,
    },
    neighbourhood: {
      type: String,
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

const ResiRent = mongoose.model("Residential_Rent", residentialRentSchema);

export default ResiRent;
