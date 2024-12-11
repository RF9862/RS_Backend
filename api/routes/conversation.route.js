import express from "express";
import {
  createConversation,
  deleteConversation,
  getConversation,
} from "../controllers/conversation.controller.js";
import { verifyToken } from "../utils/varifyUser.js";

const router = express.Router();

router.get("/:id", getConversation);

router.post("/create", createConversation);
router.delete("/delete/:chatId",  deleteConversation);

export default router;
