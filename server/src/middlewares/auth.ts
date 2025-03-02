import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../database/dbConnection";
import { User } from "../entities/User";
import { AccessToken } from "../entities/AccessToken";
import { ObjectId } from "mongodb";  // ✅ Import ObjectId from mongodb


const SECRETKEY: string = process.env.JWT_SECRET || "NULLABLEVALUEISNOTALLOWED";

/* Extend Express Request Type */
interface AuthRequest extends Request {
  user?: User;
}

/* Middleware to verify JWT token */
const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access Denied. No token provided." });
      return 
    }

    // ✅ Check if token exists in DB
    const tokenCheck = await AppDataSource.getMongoRepository(AccessToken).findOne({ where: { jwt: token } });

    if (!tokenCheck) {
      res.status(401).json({ message: "Token not found in database." });
      return 
    }

    /* ✅ Verify and decode the token */
    jwt.verify(token, SECRETKEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token." });
      }

      const tokenPayload = decoded as JwtPayload;
      if (!tokenPayload.userId) {
        return res.status(401).json({ message: "Invalid token payload." });
      }


      const userId = new ObjectId(tokenPayload.userId); // ✅ Convert to ObjectId


      /* ✅ Find the user in MongoDB */
      const userRepository = AppDataSource.getMongoRepository(User);
      const user = await userRepository.findOne({ where: { _id: userId } });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }


      req.user = user; // ✅ Ensure `req.user` is set
      next();
    });
  } catch (err) {
    console.error("❌ Authentication Middleware Error:", err);
    res.status(500).json({ message: "Internal Server Error in Authentication" });
  }
};

export default verifyToken;
