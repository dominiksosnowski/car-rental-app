// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { createClient } from "@supabase/supabase-js";

// 🔹 Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCMDPzjewTGpN4aQG8DYQE5DUV-BddU2-M",
  authDomain: "sosnowski-6d735.firebaseapp.com",
  projectId: "sosnowski-6d735",
  storageBucket: "sosnowski-6d735.appspot.com",
  messagingSenderId: "977425461760",
  appId: "1:977425461760:web:7379f9cc50360c1922dee5"
};

// 🔹 Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// 🔹 Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 🔹 Zapis tokena tylko jeśli się zmienił
async function saveTokenIfChanged(newToken) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", user.id)
    .single();

  if (existing?.token === newToken) {
    console.log("ℹ️ Token bez zmian – pomijam zapis");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("fcm_tokens")
    .upsert({
      user_id: user.id,
      role: profile?.role || "user",
      token: newToken
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Błąd zapisu tokena:", error);
  } else {
    console.log("💾 Token zapisany/odświeżony w Supabase");
  }
}

// 🔹 Prośba o pozwolenie i pobranie tokena
export async function requestPermissionAndToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("❌ Brak zgody na powiadomienia");
      return null;
    }

    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await getToken(messaging, {
      vapidKey: "BFjtfu46i53b_KLZg4Z49mlH6laQc34FAP0FWPormvy8-e5tZDRFgw5WgvDh8lPLCFyQNjAA4YgF49ZYh2HOIAE",
      serviceWorkerRegistration: reg
    });

    if (token) {
      console.log("✅ Token urządzenia:", token);
      await saveTokenIfChanged(token);
      return token;
    } else {
      console.warn("⚠️ Nie udało się pobrać tokena");
      return null;
    }
  } catch (err) {
    console.error("Błąd przy pobieraniu tokena:", err);
    return null;
  }
}

// 🔹 Cykliczne odświeżanie tokena (np. co 60 minut)
export function enableTokenAutoRefresh(intervalMinutes = 60) {
  // Pierwsze sprawdzenie od razu
  refreshToken();
  // Potem co X minut
  setInterval(refreshToken, intervalMinutes * 60 * 1000);
}

async function refreshToken() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const newToken = await getToken(messaging, {
      vapidKey: "BFjtfu46i53b_KLZg4Z49mlH6laQc34FAP0FWPormvy8-e5tZDRFgw5WgvDh8lPLCFyQNjAA4YgF49ZYh2HOIAE",
      serviceWorkerRegistration: reg
    });
    if (newToken) {
      await saveTokenIfChanged(newToken);
    }
  } catch (err) {
    console.error("Błąd odświeżania tokena:", err);
  }
}

// 🔹 Nasłuchiwanie wiadomości w foreground
export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log("📩 Powiadomienie w aplikacji:", payload);
  });
}
