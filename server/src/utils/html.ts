interface HtmlOptions {
    firstname?: string;
    lastname?: string;
    otp?: string;
  }
  
  const getHtml = (htmlFor: string, options: HtmlOptions = {}): string => {
    const { firstname = "", lastname = "", otp = "" } = options;
  
    if (htmlFor === "loginOtpHtml") {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="padding: 0px; margin: 0px;">
            <div style="font-family:Arial, Helvetica, sans-serif; font-weight: bold;">
                <div style="background-color: #0d1d32; color: #ffffff; padding: 15px; text-align: center;">
                    <img src="${process.env.API_BASE_URL}public/email/vrda1-white-logo.png" 
                         alt="VRDa1 Logo" 
                         style="width: 240px; height: auto;">
                </div>
                <div style="background-color: #ffffff; font-size: x-large; color:rgb(0, 0, 0); text-align: center; padding: 15%;">
                    <p style="color: #dc143c; margin-top: 80px; margin-bottom: 30px; font-weight:500; font-size:50px;">
                        <span style="color: black;">Dear</span> 
                        <span style="font-weight:bolder;">${firstname} ${lastname}</span>
                    </p>
                    <p>Your One-Time Password (OTP) for verification is:</p>
                    <p style="font-size: 40px; font-weight: bold; color: #dc143c; margin: 20px 0;">${otp}</p>
                    <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
                    <p style="text-align: center; margin-bottom: 80px; margin-top: 40px;">
                        <a href="${process.env.APP_BASE_URL}auth/verify-otp"
                           style="display: inline-block; padding: 23px 30px; background-color: #dc143c; font-size: 20px; font-weight: 600; color: #fff; text-decoration: none; border-radius: 10px;">
                            VERIFY OTP
                        </a>
                    </p>
                </div>
                <div style="background-color: #222222; color: #ffffff; text-align: center; padding: 2%;">
                    <div style="font-size: 20px;">Contact:</div>
                    <a href="mailto:support@vrda1.com" style="color: #1155cb; font-size: 25px;">support@vrda1.com</a>
                    <div>
                        <a href="${process.env.FACEBOOK_LINK}">
                            <img src="${process.env.API_BASE_URL}public/email/facebook_1.png" width="40px">
                        </a>
                        <a href="${process.env.LINKEDIN_LINK}">
                            <img src="${process.env.API_BASE_URL}public/email/linkedin_1.png" width="40px">
                        </a>
                    </div>
                </div>
                <div style="background-color: #111111; color: #ffffff; text-align: center; padding: 1%; font-size: 17px;">
                    Copyright © 2024 | All Rights Reserved
                </div>
            </div>
        </body>
        </html>`;
    }
  
    return "";
  };
  
  export { getHtml };
  