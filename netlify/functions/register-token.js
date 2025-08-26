import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, token } = JSON.parse(event.body || "{}");

    if (!email || !token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Brak emaila lub tokena" })
      };
    }

    // Pobierz profil użytkownika po emailu
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Nie znaleziono profilu" })
      };
    }

    // Zapisz lub zaktualizuj token
    const { error: upsertError } = await supabase
      .from("fcm_tokens")
      .upsert(
        {
          user_id: profile.id,
          role: profile.role || "user",
          token
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      throw upsertError;
    }

    console.log(`💾 Zapisano token dla ${email}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("Błąd register-token:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
