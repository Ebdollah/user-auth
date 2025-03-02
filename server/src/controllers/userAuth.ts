import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/dbConnection";
import { User } from "../entities/User";
import { AccessToken } from "../entities/AccessToken";
import { UserSettings } from "../entities/UserSettings";
import { generateAndSendOtp } from "../utils/sendOtp";
import { ObjectId } from "mongodb";
import { EmailOtp } from "../entities/EmailOtp";

declare module "express" {
  export interface Request {
    user?: User; // Allow `user` to be attached to `req`
  }
}
export enum SkipType {
  DO_NOT_ASK_AGAIN = "Do Not Ask Again",
  REMIND_ME_LATER = "Remind me after 3 days",
}

const SECRETKEY: string = process.env.JWT_SECRET || "NULLABLEVALUEISNOTALLOWED";

/* User Signup */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { username, firstName, lastName, email, password } = req.body;

    const userRepository = AppDataSource.getMongoRepository(User);

    // Check if email or username already exists
    const existingUser = await userRepository.findOne({
      where: {
        $or: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email is already registered."
            : "Username is already taken.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = userRepository.create({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await userRepository.save(newUser);

    res.status(201).json({ message: "User registered successfully." });
  } catch (err: any) {
    console.error("Signup Error:", err);

    // Handle MongoDB unique index errors
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or Username already exists." });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* User Login */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {

    const { email, password } = req.body;

    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, SECRETKEY, { expiresIn: "7d" });

    const tokenRepository = AppDataSource.getMongoRepository(AccessToken);
    const newToken = tokenRepository.create({ jwt: token });
    await tokenRepository.save(newToken);

    const settingsRepository = AppDataSource.getMongoRepository(UserSettings);
    const userSettings = await settingsRepository.findOne({
      where: { userId: user.id },
    });

    const email2fa_ = userSettings?.email2fa ?? null;
    const skipType_ = userSettings?.skipType ?? null;
    const skipTimestamp_ = userSettings?.skipTimestamp ?? null;

    res.status(200).json({
      message: "Login successful.",
      token,
      email2faStatus: email2fa_,
      skipType: skipType_,
      skipTimestamp: skipTimestamp_,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const enable2fa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_detail = req.user; // Extract current user from request

    const userId = new ObjectId(user_detail?.id); // ✅ Convert to ObjectId

    // ✅ Get MongoDB Repository for Users
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const response = await generateAndSendOtp(user, req, res);
    if (!response) {
      return res
        .status(500)
        .json({ success: false, message: "Error in enabling 2FA" });
    }

    const settingsRepository = AppDataSource.getMongoRepository(UserSettings);
    let userSettings = await settingsRepository.findOne({
      where: { userId: user.id },
    });

    if (userSettings) {
      userSettings.email2fa = false;
      userSettings.updatedAt = new Date();
      await settingsRepository.save(userSettings);
    } else {
      userSettings = settingsRepository.create({
        userId: user.id,
        email2fa: false,
        createdAt: new Date(),
      });
      await settingsRepository.save(userSettings);
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const disable2fa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_detail = req.user;
    const userId = new ObjectId(user_detail?.id);

    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const response = await generateAndSendOtp(user, req, res);
    if (!response) {
      return res
        .status(500)
        .json({ success: false, message: "Error in disabling 2FA" });
    }

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const verifyOtpForLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp_code, action } = req.body;

    if (!otp_code) {
      return res.status(400).json({
        success: false,
        message: "OTP code are required.",
      });
    }

    const user_detail = req.user;
    const userId = new ObjectId(user_detail?.id);
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const otpRepository = AppDataSource.getMongoRepository(EmailOtp);

    const otp_info = await otpRepository.findOne({
      where: {
        otpCode: otp_code,
        userId: userId,
      },
    });

    if (!otp_info) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP information.",
      });
    }
    if (otp_info.verifiedAt) {
      return res.status(400).json({
        success: false,
        message: "OTP already verified",
      });
    }
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    const now = new Date();
    const createdAt = otp_info.createdAt
      ? new Date(otp_info.createdAt)
      : new Date();

    if (now.getTime() - createdAt.getTime() > TWO_DAYS) {
      return res.status(401).json({
        success: false,
        message: "OTP expired. 2 days passed.",
      });
    }

    // const otp_info_id = new ObjectId(otp_info?.id);
    if (otp_info?.id) {
      await otpRepository.update(otp_info.id, { verifiedAt: new Date() });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error in updating OTP info.",
      });
    }


    const jwtPayload = {
      userId: user.id,
    };

    const new_token = jwt.sign(jwtPayload, SECRETKEY);

    let AccessTokenRepo = AppDataSource.getRepository(AccessToken);
    let newAccessToken = await AccessTokenRepo.findOne({
      where: { userId: user.id },
    });

    if (!newAccessToken) {
      newAccessToken = AccessTokenRepo.create();
    }

    newAccessToken.jwt = new_token;
    newAccessToken.userId = user.id;

    await AccessTokenRepo.save(newAccessToken);

    const user_otp_status_repo = AppDataSource.getRepository(UserSettings);
    const user_otp_status = await user_otp_status_repo.findOne({
      where: { userId: user.id },
    });

    if (!user_otp_status) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user otp entry" });
    }

    if (action === 0) {
      await user_otp_status_repo.update(
        { userId: user.id },
        { email2fa: true, skipType: null, skipTimestamp: null }
      );
      return res.status(200).json({
        data: {
          Access_Token: new_token,
        },
        success: true,
        message: "2FA is enabled successfully.",
      });
    }
    if (action === 1) {
      await user_otp_status_repo.update(
        { userId: user.id },
        { email2fa: false, skipType: null, skipTimestamp: null }
      );
      return res.status(200).json({
        data: {
          Access_Token: new_token,
        },
        success: true,
        message: "2FA is disabled successfully.",
      });
    }
    return res.status(200).json({
      data: {
        Access_Token: new_token,
      },
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const check2faStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_detail = req.user;
    const userId = new ObjectId(user_detail?.id);
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const user_otp_status_repo = AppDataSource.getRepository(UserSettings);
    const user_otp_status = await user_otp_status_repo.findOne({
      where: { userId: user.id },
    });

    if (!user_otp_status) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user otp entry" });
    }
    return res.status(200).json({
      success: true,
      message: `2FA status is ${
        user_otp_status?.email2fa === true ? "enabled" : "disabled"
      }`,
      data: {
        email2fa: user_otp_status?.email2fa,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const change2faStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skipType, skipTimestamp } = req.body;
    if (!skipType) {
      return res.status(400).json({
        success: false,
        message: "SkipType are required.",
      });
    }

    const user_detail = req.user;
    const userId = new ObjectId(user_detail?.id);
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }
    const validSkipTypes = [
      SkipType.DO_NOT_ASK_AGAIN,
      SkipType.REMIND_ME_LATER,
    ];
    if (!validSkipTypes.includes(skipType)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid skipType value. Allowed values are "DO_NOT_ASK_AGAIN" or "REMIND_ME_LATER".',
      });
    }
    const user_otp_status_repo = AppDataSource.getRepository(UserSettings);
    let userOtpSettings = await user_otp_status_repo.findOne({
      where: { userId: user.id },
    });

    if (!userOtpSettings) {
      // Create new entry
      userOtpSettings = user_otp_status_repo.create({
        userId: user.id,
        email2fa: false,
        createdAt: new Date(),
      });
    } else {
      // Update existing entry
      userOtpSettings.email2fa = false;
      userOtpSettings.updatedAt = new Date();
    }

    if (skipType === SkipType.DO_NOT_ASK_AGAIN) {
      userOtpSettings.skipType = skipType;
    } else if (skipType === SkipType.REMIND_ME_LATER) {
      if (!skipTimestamp) {
        return res.status(400).json({
          success: false,
          message:
            'skipTimestamp is required when skipType is "REMIND_ME_LATER".',
        });
      }
      userOtpSettings.skipType = skipType;
      userOtpSettings.skipTimestamp = skipTimestamp;
    }
    await user_otp_status_repo.save(userOtpSettings);

    return res.status(200).json({
      success: true,
      message: `2FA status set to ${skipType} successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const triggerOtpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_detail = req.user;
    const userId = new ObjectId(user_detail?.id);
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }
    const user_otp_status_repo = AppDataSource.getRepository(UserSettings);
    let userOtpSettings = await user_otp_status_repo.findOne({
      where: { userId: user.id },
    });

    if (!userOtpSettings) {
      // Create new entry
      userOtpSettings = user_otp_status_repo.create({
        userId: user.id,
        createdAt: new Date(),
      });
    }

    let three_day_reminder_flag = false;
    if (userOtpSettings?.email2fa === false) {
      const currentTime = new Date();

      if (userOtpSettings?.skipType === SkipType.DO_NOT_ASK_AGAIN) {
        console.log("Skipping 2FA prompt as per user preference.");
      } else if (userOtpSettings?.skipType === SkipType.REMIND_ME_LATER) {
        if (userOtpSettings?.skipTimestamp) {
          const skipTime = new Date(userOtpSettings?.skipTimestamp);
          const threeDaysLater = new Date(skipTime);
          threeDaysLater.setDate(skipTime.getDate() + 3);

          if (currentTime >= threeDaysLater) {
            three_day_reminder_flag = true;
          }
          return res.status(200).json({
            data: {
              three_day_reminder_flag: three_day_reminder_flag,
            },
            sucess: true,
            message: "Reminder will be send after 3 days.",
          });
        }
      }
    }
    if (userOtpSettings?.email2fa === true) {
      const response = await generateAndSendOtp(user, req, res);
      return res.status(200).json(response);
    }

    return res.status(200).json({
      sucess: true,
      message: "OTP Settings has not been set.",
    });
  } catch (err) {
    next(err);
  }
};


export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_detail = req.user;
    const userId = new ObjectId(user_detail?.id);
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ where: { _id: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    return res.status(200).json({
      success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
    });
  } catch (err) {
    next(err);
  }
}
