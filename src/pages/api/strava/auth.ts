import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.STRAVA_CLIENT_ID) {
    console.error("❌ ERROR: STRAVA_CLIENT_ID is not set!");
    return res.status(500).json({ error: "STRAVA_CLIENT_ID is missing" });
  }

  const client_id = process.env.STRAVA_CLIENT_ID;
  const redirect_uri = process.env.STRAVA_REDIRECT_URI;

  const auth_url = `https://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=read,activity:read`;

  res.redirect(auth_url);
}