//app.ts
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { AppDataSource } from "./database/dbConnection"; // ✅ Correct
import { errorMiddleware } from "./middlewares/error";
import userRouter from "./routes/userRouter";
import { Request, Response, NextFunction } from "express";

export const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers

  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRouter);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

interface ErrorMiddleware {
    (err: Error, req: Request, res: Response, next: NextFunction): void;
}

const errorHandler: ErrorMiddleware = (err, req, res, next) => errorMiddleware(err, req, res, next);

app.use(errorHandler);
