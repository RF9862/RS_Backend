import express from "express";
import {
  googleSignIn,
  signOut,
  signin,
  singup
} from "../controllers/auth.controller.js";

const route = express.Router();
route.get("/signup", (req, res) => {
  res.send("api ssssssssss...");
});

route.post("/signup", singup);
route.post("/signin", signin);
route.post("/google", googleSignIn);
route.get("/signout", signOut);
export default route;
