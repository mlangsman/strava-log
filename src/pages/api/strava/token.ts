import { NextApiRequest, NextApiResponse } from "next";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
let accessToken = process.env.STRAVA_ACCESS_TOKEN;
let refreshToken = process.env.STRAVA_REFRESH_TOKEN;
let expiresAt = 0; // Store token expiration timestamp

async function refreshAccessToken() {
  console.log("🔄 Refreshing Strava Access Token...");

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    expiresAt = data.expires_at;

    console.log("✅ New access token received");
  } else {
    console.error("❌ Failed to refresh token:", data);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime >= expiresAt) {
    await refreshAccessToken();
  }

  res.status(200).json({ access_token: accessToken });
}