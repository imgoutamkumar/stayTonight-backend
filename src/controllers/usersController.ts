import express, { Request, Response } from "express";
import mongooose from "mongoose";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  try {
    const { firstName, lastName, email, password } = req.body;
    const existedUser = await User.findOne({ email: email });
    if (existedUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    const user = await User.create({ firstName, lastName, email, password });
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    return res.status(200).json({
      message: "User Craeted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const existedUser = await User.findOne({ email: email });
    if (!existedUser) {
      return res.status(400).json({ message: "User not registered" });
    }
    const validPassword = await bcrypt.compare(password, existedUser.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: existedUser._id, role: existedUser.role },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    return res.status(200).send({
      message: "User registration success",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong!",
    });
    console.log(error);
  }
};

export const logOut = (req: Request, res: Response) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  res.send();
};

export const validateToken = async (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
};

//module.exports = { signIn, register, validateToken, logOut };
