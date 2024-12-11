import express from "express";
import {
  deleteUser,
  updateUser,
  getUser,
  getAllUser,
  userPosts,
  uploadAvatar,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/varifyUser.js";

const router = express.Router();

router.get("/:id", getUser);
router.post("/", verifyToken, getAllUser);
router.post("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/posts/:id", userPosts);
router.post("/avatarUpload", verifyToken, uploadAvatar);

export default router;
