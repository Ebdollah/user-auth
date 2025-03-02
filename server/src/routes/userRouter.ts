import express from "express";
// import { signup, login } from "../src/controllers/userAuth";
import { Request, Response, NextFunction } from "express";
import { signup, login, enable2fa, verifyOtpForLogin, disable2fa, change2faStatus, check2faStatus, triggerOtpVerification, currentUser } from "../controllers/userAuth";
import { validationResult } from 'express-validator';

import verifyTokenMiddleware from '../middlewares/auth';


const router = express.Router();

router.post(
    "/signup",
    (req: Request, res: Response, next: NextFunction): void => {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
          res.status(422).json({ errors: errors.array() });
          return; // Explicit return to ensure function ends
        }
    
        signup(req, res, next).catch(next); // Pass errors to Express
      }
);

router.post(
    "/login", 
    (req: Request, res: Response, next: NextFunction): void => {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
          res.status(422).json({ errors: errors.array() });
          return; // Explicit return to ensure function ends
        }
        login(req, res, next).catch(next); // Pass errors to Express
      }
);
router.post(
  '/enable2fa', 
  verifyTokenMiddleware, 
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Explicit return to ensure function ends
    }
    enable2fa(req, res, next).catch(next);
  }
)

router.post(
  "/disable2fa",
  verifyTokenMiddleware,
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Ensure function exits after response
    }
    disable2fa(req, res, next).catch(next);
  }
);

router.post(
  "/otp-verification", 
  verifyTokenMiddleware, 
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Explicit return to ensure function ends
    }
    verifyOtpForLogin(req, res, next).catch(next);
  }
);

router.post(
  "/change2faStatus",
  verifyTokenMiddleware,
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Ensure function exits after response
    }
    change2faStatus(req, res, next).catch(next);
  }
);

router.post(
  "/check2faStatus",
  verifyTokenMiddleware,
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Ensure function exits after response
    }
    check2faStatus(req, res, next).catch(next);
  }
);

router.post(
  "/trigger-otp-verification",
  verifyTokenMiddleware,
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Ensure function exits after response
    }
    triggerOtpVerification(req, res, next).catch(next);
  }
);

router.get(
  "/current-user", 
  verifyTokenMiddleware, 
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return; // Ensure function exits after response
    }
    currentUser(req, res, next).catch(next);
  }
  
);

// router.get("/logout", verifyTokenMiddleware, logout);
// router.post('/verify-otp', verifyTokenMiddleware, verifyOtpForLogin)
// router.post('/resend-otp', verifyTokenMiddleware, resendOtpForLogin)






// router.post("/password/forgot", forgotPassword);
// router.put("/password/reset/:token", resetPassword);

export default router;
