export default async function handler(req, res) {
    const { code } = req.query; // Get the "code" Strava sent us
  
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });
  
    const data = await response.json(); // Convert response to JSON
  
    if (data.access_token) {
      res.redirect(`/dashboard?access_token=${data.access_token}`); // Redirect user to dashboard
    } else {
      res.status(400).json({ error: "Failed to authenticate with Strava" });
    }
  }