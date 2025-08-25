import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";
import { sendNotificationByRole } from "./notifications.js";

dotenv.config();

// Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json", "utf8")
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
app.use(cors());
app.use(express.json());

// Wysyłka do adminów
app.post("/send-to-admins", async (req, res) => {
  try {
    const response = await sendNotificationByRole(
      "admin",
      "📢 Powiadomienie dla adminów",
      "To widzą wszyscy admini",
      process.env.NOTIFICATION_LINK || "https://sosnowski.netlify.app"
    );
    res.send(response);
  } catch {
    res.status(500).send("Błąd wysyłki");
  }
});

// Wysyłka do managerów
app.post("/send-to-managers", async (req, res) => {
  try {
    const response = await sendNotificationByRole(
      "manager",
      "🎯 Powiadomienie dla managerów",
      "To widzą tylko managerowie",
      process.env.NOTIFICATION_LINK || "https://sosnowski.netlify.app"
    );
    res.send(response);
  } catch {
    res.status(500).send("Błąd wysyłki");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend działa na http://localhost:${PORT}`));
