async function main() {
  const url = "https://uvizajapp.vercel.app/api/customers/forgot-password";
  const email = "theitxprts@gmail.com";
  console.log(`Sending POST request to ${url} with email: ${email}...`);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const text = await res.text();
    console.log(`\nResponse Status: ${res.status}`);
    console.log(`Response Body:   ${text}`);
  } catch (error: any) {
    console.error("HTTP request failed:", error.message || error);
  }
}

main();
