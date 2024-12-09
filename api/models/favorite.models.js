import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: ObjectId,
      required: true,
    },
    list_id: {
      type: ObjectId,
      required: true,
    },
    cate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
