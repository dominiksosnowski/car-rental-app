// netlify/functions/lib/notifications.js
import admin from "./firebase-admin.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function sendNotificationByRole(role, title, body, link) {
  // Pobierz tokeny urządzeń dla danej roli
  const { data: tokensData, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("role", role);

  if (error) throw new Error(`Supabase error: ${error.message}`);

  const tokens = (tokensData || []).map((r) => r.token).filter(Boolean);
  if (!tokens.length) {
    return { success: true, sent: 0, info: "Brak tokenów dla tej roli" };
  }

  // Przygotuj wiadomość
  const message = {
    notification: { title, body },
    data: link ? { link } : {},
    tokens
  };

  // Wyślij przez Firebase Admin
  const res = await admin.messaging().sendEachForMulticast(message);

  return {
    success: true,
    requested: tokens.length,
    sent: res.successCount,
    failed: res.failureCount,
    responses: res.responses.map((r) => ({
      success: r.success,
      error: r.error?.message
    }))
  };
}
