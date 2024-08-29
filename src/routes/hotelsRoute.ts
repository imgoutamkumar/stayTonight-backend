import express from "express";
import {
  createHotels,
  getHotels,
  upload,
  getHotelById,
  updateHotelById,
  searchHotels,
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

router.get("/all", verifyToken, getHotels);
router.get("/id/:id", verifyToken, getHotelById);
router.put("/:id", upload.array("imageFiles", 8), verifyToken, updateHotelById);
router.get("/search", searchHotels);
//module.exports = router;
export default router;
