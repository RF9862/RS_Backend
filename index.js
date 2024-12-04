import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRouter from "./api/routes/user.route.js";
import auth from "./api/routes/auth.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import postRouter from "./api/routes/post.route.js";
import messageRouter from "./api/routes/message.route.js";
import conversationRoute from "./api/routes/conversation.route.js";
import notificatonRoute from "./api/routes/notification.route.js";
import adminRouter from "./api/routes/admin.route.js";
import helperRouter from "./api/routes/helper.route.js";
import path from "path";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cookieParser());

const expressServer = http.createServer(app);
// app.use(cors()); // You may also specify options depending on your requirements
//Handling CORS origin
if (process.env.NODE_ENV === "local") {
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8081",
        "http://172.20.60.63:8081",
        "http://172.20.60.63:8082",
        "http://192.168.189.1:8081",
        "http://localhost:5173",
      ],
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );
}

const PORT = process.env.PORT || 3000;

// Connect to the database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO);
  console.log("Database connected");

  // const hashedPassword = bcrypt.hashSync("1234", 10);
  // const newUser = new User({
  //   username: "ananjuda",
  //   email: "ananjuda@gmail.com",
  //   password: hashedPassword,
  //   role: 5,
  // });

  // await newUser.save();
}

// Starting the server
expressServer.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", auth);
app.use("/api/posts", postRouter);
app.use("/api/message", messageRouter);
app.use("/api/conversation", conversationRoute);
app.use("/api/notification", notificatonRoute);

app.use("/api/admin", adminRouter);
app.use("/api/helper", helperRouter);

app.get("/test", (req, res) => {
  res.send("Success of Test API");
});
//============== Deployment==============//

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  const staticFilesPath = path.join(__dirname, "client", "dist");
  app.use(express.static(staticFilesPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticFilesPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("api listing...");
  });
}

//============== Deployment==============//

// Handle middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

//----------------------------Handling Socket.io ------------------------------//

//Handling CORS origin
export const io = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://property-sell.vercel.app",
      "https://property-sell-gjz462ec1-emoncr.vercel.app/",
      "http://localhost:3000",
      "https://property-sell.onrender.com",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`socket connected with ${socket.id}`);

  //=======Messaging Feature Here ======//
  socket.on("join_room", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (data) => {
    socket.to(data.chatId).emit("receive_message", data);
    socket.broadcast.emit(`${data.to}`, data);
  });

  socket.on("disconnect", (data) => {
    console.log(`user disconnected successfully ${socket.id}`);
  });
});
