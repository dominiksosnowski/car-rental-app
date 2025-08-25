export async function handler(event) {
  const { email, token } = JSON.parse(event.body || "{}");
  console.log("📥 Otrzymano token:", email, token);
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}
