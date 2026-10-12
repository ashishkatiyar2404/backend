import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from docker Compose",
  });
});

app.listen(PORT, () => {
  console.log("server connected " + PORT);
});
