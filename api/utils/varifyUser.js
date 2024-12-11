import jwt from "jsonwebtoken";
import { throwError } from "./error.js";

// export const verifyToken = (req, res, next) => {
//   console.log("^^^^^^^^^^^", req);
//   const tooken = req.cookies.access_token;
//   if (!tooken) return next(throwError(401, "Session End. Login Again! "));
//   jwt.verify(tooken, process.env.JWT_SECRET, (err, user) => {
//     if (err) return next(throwError(403, "Frbidden"));
//     req.user = user;
//     next();
//   });
// };

export const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];  // Authorization: Bearer <token>
  if (!token) return next(throwError(401, "Session End. Login Again!"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(throwError(403, "Forbidden"));
    req.user = user;
    next();
  });
};