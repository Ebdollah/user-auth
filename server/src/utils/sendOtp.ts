import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../database/dbConnection";
import { EmailOtp } from "../entities/EmailOtp";
import { getHtml } from "./html";
import emailGenerator from "../utils/emailGenerator";

/* Define Type for User */
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/* Generate OTP and Send Email */
export const generateAndSendOtp = async (
  user: User,
  req: Request,
  res: Response
): Promise<{ success: boolean; message: string }> => {
  try {
    const otpRepository = AppDataSource.getMongoRepository(EmailOtp);

    // ✅ Generate a random 6-digit OTP
    const randomOtp: string = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Generate a new OTP token if none exists
    let otpToken: string = uuidv4();

    // ✅ Update or Insert OTP entry in MongoDB
    const otpInfo = await otpRepository.findOneAndUpdate(
      { userId: user.id }, // Search by userId
      { $set: { otpCode: randomOtp, otpToken, createdAt: new Date(), verifiedAt: null } }, // Update fields
      { upsert: true, returnDocument: "after" } // If not found, insert
    );

    console.log(`✅ OTP Generated for User (${user.email}):`, randomOtp);

    // ✅ Prepare email options
    const options = {
      firstname: user.firstName || "User",
      lastname: user.lastName || "",
      email: user.email,
      otp: randomOtp,
    };

    // ✅ Generate HTML email content
    const verifyHtml = getHtml("loginOtpHtml", options);

    // ✅ Send OTP via email
    const emailResponse = await emailGenerator(
      user.email,
      "Two Factor Authentication - One Time Password (OTP)",
      verifyHtml
    );

    if (!emailResponse.success) {
      throw new Error("Email sending failed.");
    }

    return { success: true, message: "OTP has been sent." };
  } catch (err) {
    console.error("❌ Error in generateAndSendOtp:", err);
    return { success: false, message: "Failed to send OTP." };
  }
};



// import { EntityManager } from "typeorm";
// import { v4 as uuidv4 } from "uuid";
// import { EmailOtp } from "../entities/EmailOtp";
// import { getHtml } from "./html";
// import emailGenerator from "../utils/emailGenerator";
// import { Request, Response } from "express";
// import { AppDataSource } from "../database/dbConnection";

// interface User {
//   id: string;
//   email: string;
//   firstName?: string;
//   lastName?: string;
// }

// export const generateAndSendOtp = async (
//   user: any,
//   req: any,
//   res: any
// ) => {
//   try {
//     const otpRepository = AppDataSource.getMongoRepository(EmailOtp);
//     const randomOtp: string = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     const otpInfo = await otpRepository.findOne({ where: { userId: user.id } });

//     const otpToken: string = otpInfo?.otpToken ?? uuidv4();

//     if (otpInfo) {
//       // ✅ Update existing OTP record
//       await otpRepository.update(
//         { id: otpInfo.id },
//         { otpCode: randomOtp, createdAt: new Date(), verifiedAt: null }
//       );
//     } else {
//       // ✅ Create a new OTP record
//       const otpGenerate = otpRepository.create({
//         userId: user.id,
//         otpCode: randomOtp,
//         otpToken: otpToken,
//         createdAt: new Date(),
//       });

//       await otpRepository.save(otpGenerate);
//     }

//     const options = {
//       firstname: "John",
//       lastname: "Doe",
//       email: "l201165@lhr.nu.edu.pk",
//       otp: randomOtp,
//     };

//     const verifyHtml = getHtml("loginOtpHtml", options);

//     await emailGenerator(
//       options.email,
//       "Two Factor Authentication - One Time Password (OTP)",
//       verifyHtml
//     );
//     return { success: true, message: "OTP has been sent." };
//   } catch (err) {
//     console.error("Error in generateAndSendOtp:", err);
//     return { success: false, message: "Failed to send OTP." };
//   }
// };
