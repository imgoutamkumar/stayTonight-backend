import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Hotel, { HotelType } from "../models/hotel";
import mongoose from "mongoose";

export type HotelSearchResponse = {
  data: HotelType[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

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

    // console.log("uploadPromises ", uploadPromises);
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

export const getHotels = async (req: Request, res: Response) => {
  try {
    //console.log(req.userId);
    const hotels = await Hotel.find({ createrId: req.userId });
    // console.log(hotels);
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  const id = req.params.id.toString();

  try {
    const hotel = await Hotel.findOne({ _id: id, createrId: req.userId });
    res.status(200).json(hotel);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong while fetching hotel by id" });
  }
};

export const updateHotelById = async (req: Request, res: Response) => {
  const id = req.params.id.toString();

  try {
    const updatedHotel: HotelType = req.body;
    updatedHotel.lastUpdated = new Date();

    const hotel = await Hotel.findOneAndUpdate(
      {
        _id: req.params.id,
        createrId: req.userId,
      },
      updatedHotel,
      { new: true }
    );
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const imageFiles = req.files as Express.Multer.File[];
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI);
      return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    hotel.imageUrls = [...imageUrls, ...(updatedHotel.imageUrls || [])];

    await hotel.save();
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const searchHotels = async (req: Request, res: Response) => {
  console.log("Search controller called");

  //console.log(req.query);
  const query = constructSearchQuery(req.query);
  //console.log(query);

  let sortOptions = {};
  switch (req.query.sortOptions) {
    case "starRating":
      sortOptions = {
        starRating: -1,
      };
      break;
    case "pricePerNightAsc":
      sortOptions = { pricePerNight: 1 };
      break;
    case "pricePerNightDesc":
      sortOptions = { pricePerNight: -1 };
      break;
  }

  try {
    const numberOfDataPerPage = 10;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * numberOfDataPerPage;
    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(numberOfDataPerPage);
    // const total = await Hotel.countDocuments();
    const total = await Hotel.countDocuments(query);
    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / numberOfDataPerPage),
      },
    };
    // console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Service not working, Something went wrong" });
  }
};

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { state: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.type) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.type)
        ? queryParams.type
        : [queryParams.type],
    };
  }

  if (queryParams.stars) {
    const starRating = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $eq: starRating };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};
