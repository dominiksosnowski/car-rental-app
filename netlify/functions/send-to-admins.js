// netlify/functions/send-to-admins.js
import { sendNotificationByRole } from "./notifications.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const response = await sendNotificationByRole(
      "admin",
      "📢 Powiadomienie dla adminów",
      "To widzą wszyscy admini",
      process.env.NOTIFICATION_LINK || "https://sosnowski.netlify.app"
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Błąd wysyłki" })
    };
  }
}
