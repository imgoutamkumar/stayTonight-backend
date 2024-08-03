import express, { urlencoded } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bodyparser from "body-parser";
import { v2 as cloudinary } from "cloudinary";

const app = express();
app.use(cookieParser());
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import usersRoute from "./routes/usersRoute";
app.use("/api/user", usersRoute);

import hotelsRoute from "./routes/hotelsRoute";
app.use("/api/hotel", hotelsRoute);

app.listen(process.env.PORT, () => {
  console.log(`server is running on Port :${process.env.PORT}`);
  mongoose
    .connect(process.env.MONGODB_URL as string)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((error) => {
      console.log(error);
    });
});
