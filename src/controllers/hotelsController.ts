import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Hotel, { HotelType } from "../models/hotel";
import mongoose from "mongoose";

const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 8MB
  },
});

export const createHotels = async (req: Request, res: Response) => {
  try {
    console.log("createHotels called");
    const imageFiles = req.files as Express.Multer.File[];
    const newHotel: HotelType = req.body;

    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI);
      return res.url;
    });

    console.log("uploadPromises ", uploadPromises);
    const imageUrls = await Promise.all(uploadPromises);
    newHotel.imageUrls = imageUrls;
    newHotel.lastUpdated = new Date();
    newHotel.createrId = req.userId;
    const hotel = new Hotel(newHotel);
    hotel.save();
    res.status(201).json({
      message: "Hotel created",
    });
  } catch (error) {
    console.log("Error creating hotel : ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getHotels = (req: Request, res: Response) => {
  try {
    const hotels = Hotel.find({ userId: req.userId });
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
