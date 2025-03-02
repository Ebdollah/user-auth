import nodemailer from "nodemailer";

// For local testing only
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_USER = "fahadwaseem8@gmail.com"//"ebd.waseem@vrda1.com";
const SMTP_PASS = "bjki kxsj npav jbae"; // Only for local testing

function emailTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true, // Set to true for port 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

async function emailGenerator(to: string, subject: string, html: string) {
  const transporter = emailTransport();
  const mailOptions = {
    from: SMTP_USER,
    to,
    subject,
    html
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return { result: result, success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Check configuration and network connectivity.');
  }
}

export default emailGenerator;
// import nodemailer, { Transporter } from "nodemailer";
//     const SMTP_HOST = "smtp.gmail.com";
//     const SMTP_PORT = 465;
//     const SMTP_USER = "ebd.waseem@vrda1.com";
//     const SMTP_PASS = "bjki kxsj npav jbae";
//     const SMTP_SECURE = 'false';
//     const MAIL_ENCRYPTION = "ssl";

// function emailTransport() {
    


//   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
//       throw new Error('SMTP configuration is missing. Check .env file.');
//   }

//   return nodemailer.createTransport({
//       host: SMTP_HOST,
//       port: SMTP_PORT,
//       secure: false, // Convert string to boolean
//       auth: {
//           user: SMTP_USER,
//           pass: SMTP_PASS
//       },
//       tls: {
//           rejectUnauthorized: false // Useful for development
//       }
//   });
// }
// async function emailGenerator(to:string, subject:string, html:string) {
//   const transporter = emailTransport();

//   const mailOptions = {
//       from: SMTP_USER,
//       to,
//       subject,
//       html
//   };

//   try {
//       const result = await transporter.sendMail(mailOptions);
//       console.log('Email sent:', result.messageId);
//       return { result: result, success: true, message: "Email sent successfully." };
//       // return result;
//   } catch (error) {
//       console.error('Error sending email:', error);
//       throw new Error('Failed to send email. Check configuration and network connectivity.');
//   }
// }

// export default emailGenerator;


// // const emailGenerator = async (
// //   to: string,
// //   subject: string,
// //   htmlContent: string,
// //   textContent: string = ""
// // ): Promise<EmailResponse> => {
// //   try {
// //     const MAIL_HOST = "smtp.gmail.com";
// //     const MAIL_PORT = 465;
// //     const MAIL_USERNAME = "ebd.waseem@gmail.com";
// //     const MAIL_PASSWORD = "bjki kxsj npav jbae";
// //     const MAIL_ENCRYPTION = "ssl";

// //     // ✅ Ensure required environment variables exist
// //     // if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
// //     //   console.error("❌ Missing Mail Environment Variables.");
// //     //   return { success: false, message: "Email service misconfigured." };
// //     // }

// //     const transporter: Transporter = nodemailer.createTransport({
// //       host: MAIL_HOST,
// //       port: MAIL_PORT,
// //       secure: MAIL_ENCRYPTION === "ssl", // ✅ `true` for SSL, `false` for TLS
// //       auth: {
// //         user: MAIL_USERNAME,
// //         pass: MAIL_PASSWORD,
// //       },
// //     });

// //     const mailOptions = {
// //       from: `"Test App" <${MAIL_USERNAME}>`,
// //       to,
// //       subject,
// //       text: textContent || "Your email client does not support HTML emails.",
// //       html: htmlContent,
// //     };

// //     const info = await transporter.sendMail(mailOptions);
// //     console.log("✅ Email sent successfully:", info.messageId);

// //     return { success: true, message: "Email sent successfully." };
// //   } catch (error) {
// //     console.error("❌ Error sending email:", error);
// //     return { success: false, message: "Failed to send email." };
// //   }
// // };

// // export default emailGenerator;
