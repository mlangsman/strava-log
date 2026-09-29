import { NextApiRequest, NextApiResponse } from "next";

interface StravaActivity {
  id: number;
  start_date_local: string;
  name: string;
  type: string; // Activity type (Run, Ride, etc.)
  distance: number;
  moving_time: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain: number;
  suffer_score?: number;
}

interface StravaSplit {
  split_number: number;
  distance_km: string;
  time: string;
  pace: string;
}

interface ProcessedActivity {
  id: number;
  date: string;
  name: string;
  type: string;
  distance_km: string;
  moving_time: string;
  pace: string;
  avg_hr: string;
  max_hr: string;
  elevation_gain_m: number;
  perceived_effort: string;
  splits: StravaSplit[];
}

// Format seconds as m:ss, e.g. 316 -> "5:16"
function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// Pace in minutes per km, e.g. 316 seconds over 1 km -> "5:16 /km"
function formatPace(seconds: number, metres: number): string {
  if (!metres) return "N/A";
  return `${formatDuration(seconds / (metres / 1000))} /km`;
}

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenRes = await fetch("http://localhost:3000/api/strava/token");
      const { access_token } = await tokenRes.json();
  
      if (!access_token) {
        return res.status(401).json({ error: "Failed to retrieve access token" });
      }

    const response = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=30",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API Error: ${response.status}`);
    }

    const activities: StravaActivity[] = await response.json();

    const detailedActivities: ProcessedActivity[] = (await Promise.all(
      activities.map(async (activity): Promise<ProcessedActivity | null> => {
        const activityResponse = await fetch(
          `https://www.strava.com/api/v3/activities/${activity.id}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        if (!activityResponse.ok) return null;
        const activityDetails: { splits_metric?: { distance: number; moving_time: number }[] } = await activityResponse.json();

        return {
          id: activity.id,
          date: activity.start_date_local.split("T")[0],
          name: activity.name,
          type: activity.type,
          distance_km: (activity.distance / 1000).toFixed(2),
          moving_time: `${Math.floor(activity.moving_time / 60)} min ${activity.moving_time % 60} sec`,
          pace: formatPace(activity.moving_time, activity.distance),
          avg_hr: activity.average_heartrate?.toString() || "N/A",
          max_hr: activity.max_heartrate?.toString() || "N/A",
          elevation_gain_m: activity.total_elevation_gain || 0,
          perceived_effort: activity.suffer_score?.toString() || "N/A",
          splits: activityDetails.splits_metric?.map((split, index) => ({
            split_number: index + 1,
            distance_km: (split.distance / 1000).toFixed(2),
            time: formatDuration(split.moving_time),
            pace: formatPace(split.moving_time, split.distance),
          })) || [],
        };
      })
    )).filter((a): a is ProcessedActivity => a !== null); // Ensure no null values

    res.status(200).json(detailedActivities);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
