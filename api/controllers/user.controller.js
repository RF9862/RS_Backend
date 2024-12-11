import Listing from "../models/listing.models.js";
import User from "../models/user.models.js";
import { throwError } from "../utils/error.js";
import bcrypt from "bcrypt";

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return throwError(404, "User not found");

    const { password, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getAllUser = async (req, res, next) => {

  const { flt } = req.body;
  let query;
  if (flt != "") query = { email: { $regex: flt, $options: "i" } };
  let users = "";
  try {
    if (flt != "") users = await User.find(query);
    else users = await User.find(); // Retrieve all users


    const requestUser = await User.findById(req.user.id);
    let permission = 0;
    // Process response based on the user's role
    if (requestUser.role === 5 ) {
      // Send full detail and salesperson for roles 5 and 2
      permission = 1;
      res.status(200).json({ users, permission });
    } else {
      // Handle cases where the user's role doesn't match the above conditions
      res.status(403).json({ error: "Access denied" });
    }

  } catch (error) {
    next(error);
  }
};

//=======update user api=======//
export const updateUser = async (req, res, next) => {
  const { email, username } = req.body;
  if (req.user.id !== req.params.id)
    return next(throwError(401, "User Invalid"));

  const checkEmail = await User.findOne({ email });
  if (checkEmail) return next(throwError(500, "Invalid Information"));

  const checkUserName = await User.findOne({ username });
  if (checkUserName) return next(throwError(500, "Invalid Information"));

  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updateUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(throwError(error));
  }
};

//=====Handle User Delete=====//
export const deleteUser = async (req, res, next) => {
  console.log("======", req.user.id);
  // if (req.user.id !== req.params.id)
  //   return next(throwError(401, "User Invalid"));
  try {
    await User.findByIdAndDelete(req.params.id);
    // res.clearCookie("access_token");
    res.status(200).json("User Deleted Successfully!");
  } catch (error) {
    next(error);
  }
};

//=====Get User Created Post=====//
export const userPosts = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(throwError(401, "You can see only your posts"));
  try {
    const posts = await Listing.find({ userRef: req.params.id });
    res.status(200).json(posts);
  } catch (error) {
    next(throwError(404, error.message));
  }
};



import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create an uploads directory if it doesn't exist

// Define the upload route
export const uploadAvatar = async (req, res, next) => {
  // Middleware for handling file upload
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Error during file upload middleware:", err);
      return res.status(500).json({ error: "File upload failed." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    try {
      const result = await User.updateOne(
        { _id: req.body.id },
        {
          $set: {
            avatar: req.file.buffer,
            contentType: req.file.mimetype,
          },
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.status(200).json({
        message: "File uploaded successfully!",
        buffer: req.file.buffer,
        type: req.file.mimetype,
      });
    } catch (error) {
      console.error("Error during file upload operation:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};