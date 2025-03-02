// import { User } from "../entities/User";
// import { AccessToken } from "../entities/AccessToken.ts";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { AccessToken } from "../entities/AccessToken";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: process.env.MONGO_URI,
  database: "MERN_AUTHENTICATION",
  useUnifiedTopology: true,
  synchronize: true,
  logging: true,
  // entities: [User, AccessToken], // Register entities here
  entities: ["./src/entities/*.ts"],
  useNewUrlParser: true,
});
