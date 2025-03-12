import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.query; // Get access token from request

  if (!access_token) {
    return res.status(400).json({ error: "Missing access token" });
  }

  try {
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Strava API Error: ${response.status}`);
    }

    const userData = await response.json();
    res.status(200).json(userData); // Send user data back to frontend
} catch (error: unknown) {
    let errorMessage = "Unknown error occurred";
  
    if (error instanceof Error) {
      errorMessage = error.message; // ✅ TypeScript now understands error has `message`
    }
  
    res.status(500).json({ error: errorMessage });
  }
}