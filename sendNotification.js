import admin from "firebase-admin";
import { readFileSync } from "fs";

// Wczytanie klucza serwisowego z pliku
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

// Inicjalizacja Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Token urządzenia z frontendu (getToken())
const registrationToken = "WKLEJ_TUTAJ_TOKEN_URZĄDZENIA";

const message = {
  token: registrationToken,
  notification: {
    title: "Nowa wiadomość 📩",
    body: "Hej! To jest testowe powiadomienie z Node.js"
  },
  webpush: {
    fcmOptions: {
      link: "https://sosnowski.netlify.app" // kliknięcie w powiadomienie
    }
  }
};

// Wysyłka powiadomienia
admin.messaging().send(message)
  .then((response) => {
    console.log("✅ Powiadomienie wysłane:", response);
  })
  .catch((error) => {
    console.error("❌ Błąd wysyłki:", error);
  });
