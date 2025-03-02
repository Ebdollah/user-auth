//server.ts
import { app } from "./app";
import { AppDataSource } from "./database/dbConnection";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load .env variables
const PORT = process.env.PORT || 8000; // Default to 5000 if undefined

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to MongoDB using TypeORM.");
    app.listen(process.env.PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });
