import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message:
      "Hello from microservices--- BACKEND/ GATEWAY " + process.env.SERVER_NAME,
  });
});

app.use("/auth", proxy("http://auth-service:8001"));
app.use("/order", proxy("http://order-service:8002"));
app.use("/payment", proxy("http://payment-service:8003"));

app.listen(PORT, () => {
  console.log("server connected " + PORT);
});
