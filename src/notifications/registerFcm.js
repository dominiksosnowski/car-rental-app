// src/notifications/registerFcm.js
import { getToken, onMessage } from "firebase/messaging";
import { createClient } from "@supabase/supabase-js";
import { messaging } from "../firebase"; // upewnij się, że eksportujesz messaging w src/firebase.js

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function registerFcm() {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker nie jest wspierany w tej przeglądarce");
      return;
    }

    // 1) Rejestracja service workera
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    // 2) Pobranie emaila zalogowanego użytkownika z Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    const email = user && user.email;
    if (!email) {
      console.warn("Brak zalogowanego użytkownika — pomijam rejestrację FCM");
      return;
    }

    // 3) Uprawnienia do powiadomień
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Powiadomienia zostały zablokowane przez użytkownika");
      return;
    }

    // 4) Pobranie tokenu z przekazaniem zarejestrowanego SW
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg
    });

    if (!token) {
      console.warn("Nie udało się pobrać tokenu FCM");
      return;
    }

    // 5) Wysłanie tokenu do backendu (z email)
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token })
    });

    // 6) Obsługa powiadomień w foreground (karta aktywna)
    onMessage(messaging, (payload) => {
      const { title, body } = (payload && payload.notification) || {};
      try {
        new Notification(title || "Powiadomienie", { body: body || "" });
      } catch {
        console.log("Powiadomienie (foreground):", payload);
      }
    });

    console.log("✅ FCM zarejestrowane, token wysłany do backendu");
  } catch (err) {
    console.error("❌ Błąd rejestracji FCM:", err);
  }
}
