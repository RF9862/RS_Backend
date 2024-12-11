import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    dbName: {
      type: String,
      required: true,
      unique: true,
    },
    dbIndex: {
      type: Number,
      required: true,
      unique: true,
    },
    userID: {
      type: String,
    },
    userName: {
      type: String,
    },    
  },
  { timestamps: true }
);

const SalesPerson = mongoose.model("SalesPerson", salesSchema);

export default SalesPerson;
