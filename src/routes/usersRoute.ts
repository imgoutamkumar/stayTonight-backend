import express from "express";
import { check } from "express-validator";
const router = express.Router();
import {
  signIn,
  register,
  validateToken,
  logOut,
} from "../controllers/usersController";
import { verifyToken } from "../middlewares/auth";

router.post(
  "/register",
  [
    check("firstName", "firstName is required").isString(),
    check("lastName", "lastName is required").isString(),
    check("email", "email is required").isString(),
    check(
      "password",
      "password is required and should be atleast of 8 character"
    ).isLength({
      min: 8,
    }),
  ],
  register
);

router.post(
  "/signIn",
  [
    check("email", "email is required").isString(),
    check(
      "password",
      "password is required and should be atleast of 8 character"
    ).isLength({
      min: 8,
    }),
  ],
  signIn
);

router.post("/logOut", logOut);

router.get("/validate-token", verifyToken, validateToken);
//module.exports = router;
export default router;
