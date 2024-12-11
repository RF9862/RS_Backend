import express from "express";
import { getMessage, postMessage } from "../controllers/message.controller.js";
import { verifyToken } from "../utils/varifyUser.js";

const router = express.Router();

router.get("/", getMessage);

router.post("/create", postMessage);

export default router;
