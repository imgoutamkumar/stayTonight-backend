import mongoose from "mongoose";

export type HotelType = {
  _id: string;
  createrId: string;
  name: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  description: string;
  type: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageUrls: string[];
  lastUpdated: Date;
  reviews: string[];
};

const hotelSchema = new mongoose.Schema<HotelType>(
  {
    createrId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    adultCount: {
      type: Number,
      required: true,
    },
    childCount: {
      type: Number,
      required: true,
    },
    facilities: [
      {
        type: String,
        required: true,
      },
    ],
    pricePerNight: {
      type: Number,
      required: true,
    },
    imageUrls: [
      {
        type: String,
        required: true,
      },
    ],
    lastUpdated: {
      type: Date,
    },
    starRating: {
      type: Number,
      //required: true,
      min: 1,
      max: 5,
    },
    reviews: [
      {
        type: String,
        //required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hotel = mongoose.model<HotelType>("hotels", hotelSchema);
export default Hotel;
