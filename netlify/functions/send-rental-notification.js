import { sendNotificationByRole } from "./lib/notifications.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { client_first, client_last, vehicle_label, start_date, end_date } = JSON.parse(event.body || "{}");

    // Nagłówek
    const title = "🚗 Dodano wypożyczenie";

    // Treść – każda linia osobno
    const body = `${client_first} ${client_last}\n${vehicle_label}\n${start_date} → ${end_date || "-"}`;

    const response = await sendNotificationByRole(
      "admin", // lub inna rola, jeśli chcesz
      title,
      body,
      process.env.NOTIFICATION_LINK || "https://sosnowski.netlify.app"
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    console.error("send-rental-notification error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
