import admin from "firebase-admin";

const requiredEnvVars = [
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const missing = requiredEnvVars.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Brak wymaganych zmiennych: ${missing.join(", ")}`);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  // Zamiana zapisanych w ENV "\n" na prawdziwe entery
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
} catch {
  throw new Error("Błąd parsowania FIREBASE_SERVICE_ACCOUNT_JSON");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;
