import express from "express";
import {
  createNotification,
  getNotification,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { verifyToken } from "../utils/varifyUser.js";

const router = express.Router();

router.post("/create", createNotification);
router.get("/:id", getNotification);
router.delete("/delete/:id", deleteNotification);

export default router;
