import express from "express";
import {
  createHotels,
  getHotels,
  upload,
} from "../controllers/hotelsController";
import { verifyToken } from "../middlewares/auth";
import { body } from "express-validator";
const router = express.Router();

router.post(
  "/create",
  upload.array("imageFiles", 8),
  verifyToken,
  [
    body("name").notEmpty().withMessage("name is required"),
    body("city").notEmpty().withMessage("city is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("pricePerNight is required and must be a number"),
  ],

  createHotels
);

router.get("/", verifyToken, getHotels);

//module.exports = router;
export default router;
