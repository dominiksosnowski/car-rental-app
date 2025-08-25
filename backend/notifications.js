// notifications.js
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Pobiera tokeny użytkowników o danej roli
 */
async function getTokensByRole(role) {
  const { data: tokens, error } = await supabase
    .from("fcm_tokens")
    .select("token, profiles!inner(role)")
    .eq("profiles.role", role);

  if (error) {
    console.error("Błąd pobierania tokenów:", error);
    return [];
  }

  return tokens.map(t => t.token);
}

/**
 * Wysyła powiadomienie do użytkowników o danej roli
 */
export async function sendNotificationByRole(role, title, body, link) {
  const tokenList = await getTokensByRole(role);

  if (!tokenList.length) {
    console.log(`Brak tokenów dla roli: ${role}`);
    return { successCount: 0, failureCount: 0 };
  }

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      notification: { title, body },
      webpush: { fcmOptions: { link } }
    });
    console.log(`Powiadomienie wysłane do roli: ${role}`);
    return response;
  } catch (err) {
    console.error("Błąd wysyłki:", err);
    throw err;
  }
}
