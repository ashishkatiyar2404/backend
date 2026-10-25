import express from "express";
import dotenv from "dotenv";
import connectedDb from "./lib/db.js";
import User from "./model/user.model.js";
import Redis from "ioredis";
import rateLimitter from "./middleWare/rateLimit.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
export const redis = new Redis(process.env.REDIS_URL);
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from Redis " + process.env.SERVER_NAME,
  });
});

app.post("/create", async (req, res) => {
  const { name, email, password } = req.body;
  await redis.del("user:all");
  const user = await User.create({
    name,
    email,
    password,
  });

  return res.json(user);
});

app.get("/get", rateLimitter, async (req, res) => {
  const user = await User.find({});
  return res.json(user);
});

app.get("/getRedis", async (req, res) => {
  const cachedData = await redis.get("user:all");
  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }
  const users = await User.find({});

  await redis.set("user:all", JSON.stringify(users));
  return res.status(200).json(users);
});
app.post("/sendOtp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const key = `otp:${email}`;

  await redis.set(key, otp, "EX", 300);

  const savedOtp = await redis.get(key);

  console.log("Key:", key);
  console.log("Saved OTP:", savedOtp);

  return res.status(200).json({ message: "OTP generated" });
});

app.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp, typeof otp);

  const cachedOtp = await redis.get(`otp:${email}`);
  console.log(cachedOtp, "cachedOtp");

  if (!cachedOtp) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (cachedOtp !== otp) {
    return res.status(400).json({ message: "OTP not match" });
  }

  return res.status(200).json({ message: "Correct OTP" });
});

app.listen(PORT, () => {
  connectedDb();
  console.log("server connected " + PORT);
});
