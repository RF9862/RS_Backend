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
import User from "./api/models/user.models.js";
import SalesPerson from "./api/models/salesPerson.models.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cookieParser());

const downloadImageAsBuffer = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

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
        "http://localhost:5174",
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

  const duplicate = await User.findOne({
    $or: [
      { username: "ananjuda" }, // Assuming your user model has a username field
      { email: "judaar@gmail.com" },
    ],
  });
  if (!duplicate) {
    const hashedPassword = bcrypt.hashSync("1234", 10);
    const avatarBuffer = await downloadImageAsBuffer(
      "https://thinksport.com.au/wp-content/uploads/2020/01/avatar-.jpg"
    );    
    const newUser = new User({
      username: "ananjuda",
      email: "judaar@gmail.com",
      phone: "+6590290238",
      password: hashedPassword,
      role: 5,
      contentType:"image/jpg",
      avatar: avatarBuffer,

    });
    await newUser.save();
  }
  // for sales person db

  const salesPerson_duplicate = await SalesPerson.findOne( {dbName: "comm_rent"} );
  const dbNames = ["comm_rent","comm_sale", "resi_rent", "resi_sale"];
  if (!salesPerson_duplicate) {

    for(let i=0;i<4;i++){
      const newSalesPerson = new SalesPerson({
        dbName: dbNames[i],
        dbIndex: i,
        userID: "",
        userName: "",
      });
      await newSalesPerson.save();
    }

  }  
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
      "http://95.216.125.17/:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://property-sell.vercel.app",
      "https://property-sell-gjz462ec1-emoncr.vercel.app/",
      "http://localhost:3000",
      "http://localhost:3001",
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

/////////////////////////////////////////////////////////////////
