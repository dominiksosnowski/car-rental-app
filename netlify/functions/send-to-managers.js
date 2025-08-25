// netlify/functions/send-to-managers.js
import { sendNotificationByRole } from "./notifications.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const response = await sendNotificationByRole(
      "manager",
      "🎯 Powiadomienie dla managerów",
      "To widzą tylko managerowie",
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
