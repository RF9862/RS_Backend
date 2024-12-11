import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import { throwError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { passwordGenarator, usernameGenarator } from "../utils/helper.js";

const downloadImageAsBuffer = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

//======handle singup route ===========//
export const singup = async (req, res, next) => {
  const { username, email, phone, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const duplicate = await User.findOne({ username, email });
  if (!duplicate) {
    const avatarBuffer = await downloadImageAsBuffer(
      "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg"
    );
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: 0,
      contentType: "image/jpg",
      avatar: avatarBuffer,
    });
    try {
      await newUser.save();
      res.status(201).json({
        success: true,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  } else {
    res.status(201).json({
      success: false,
      message: "aleardy registered",
    });
  }
};

// ========sing in route handling here =====//
export const signin = async (req, res, next) => {
  const { email, userPassword } = req.body;
  console.log("email", email);

  try {
    const validUser = await User.findOne({ email: email });
    if (!validUser) return next(throwError(404, "Worng Credentials!"));
    const isValidPassword = bcrypt.compareSync(
      userPassword,
      validUser.password
    );

    if (!isValidPassword) return next(throwError(401, "Worng Credentials!"));
    const { password, ...rest } = validUser._doc;
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "720h",
    });
    // res
    //   .cookie("access_token", token, {
    //     httpOnly: true,
    //     secure: false,//process.env.NODE_ENV === "production", // Only secure in production
    //     sameSite: "Strict", // For cross-origin cookies
    //     maxAge: 86400000, // 1 day
    //     expires: new Date(Date.now() + 86400000), // 1 day expiry
    //   })
    //   .status(200)
    //   .json(rest);
    res.status(200).json({
      ...rest,
      token,  // send token here
    });    
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//=====Handle Google Singin Here ======//
export const googleSignIn = async (req, res, next) => {
  const { email, name, photo, phone } = req.body;
  try {
    const user = await User.findOne({ email });

    //====IF user exist in DB====//
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "720h",
      });
      const { password, ...rest } = user._doc;
      res.status(200).json({
        ...rest,
        token,  // send token here
      });          
    }
    //====IF user not exist in DB====//
    else {
      const hashedPassword = bcrypt.hashSync(passwordGenarator(), 10);
      const avatarBuffer = await downloadImageAsBuffer(
        "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg"
      );
      const newUser = new User({
        name,
        username: usernameGenarator(name),
        email,
        phone,
        password: hashedPassword,
        contentType: "image/jpg",
        avatar: avatarBuffer,
      });
      const user = await newUser.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "720h",
      });
      const { pass: password, ...rest } = user._doc;
      res.status(200).json({
        ...rest,
        token,  // send token here
      });  
    }
  } catch (error) {
    //======Handling Error Here =====//
    next(throwError(error));
  }
};

//=====handle signout=====//
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User Deleted Successfully!");
  } catch (error) {
    next(error);
  }
};
