import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for sending emails
  app.post("/api/send-emails", async (req, res) => {
    const { assignments } = req.body;

    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ error: "Invalid assignments data" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      const sendPromises = assignments.map((assignment: any) => {
        const mailOptions = {
          from: process.env.SMTP_FROM || "info@tutornow.co.il",
          to: assignment.giverEmail,
          subject: "🎁 הגרלת גמד וענק!",
          html: `
            <div dir="rtl" style="font-family: sans-serif; text-align: right; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #ed3591;">שלום ${assignment.giverName}!</h2>
              <p style="font-size: 16px;">ההגרלה הסתיימה ונקבע מי הענק שלך...</p>
              <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 18px; margin: 0;">את/ה הגמד של: <strong>${assignment.receiverName}</strong></p>
              </div>
              <p>בהצלחה ומשחק מהנה! 🎅✨</p>
            </div>
          `,
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(sendPromises);
      res.json({ success: true, message: "Emails sent successfully" });
    } catch (error: any) {
      console.error("SMTP Error:", error);
      res.status(500).json({ error: "Failed to send emails", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
