import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface StravaSplit {
  split_number: number;
  distance_km: string;
  time: string;
  pace: string;
}

interface RunSummary {
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

export default function Dashboard() {
  const router = useRouter();
  const { access_token } = router.query;
  const [runs, setRuns] = useState<RunSummary[]>([]);

  useEffect(() => {
    if (!access_token || typeof access_token !== "string") return;

    async function fetchRuns() {
      try {
        const res = await fetch(`/api/strava/activities?access_token=${access_token}`);
        const data: RunSummary[] = await res.json();
        setRuns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch runs:", error);
      }
    }

    fetchRuns();
  }, [access_token]);

  function downloadRunSummary() {
    if (!Array.isArray(runs) || runs.length === 0) return;

    let fileContent = `# Strava Training Log 📊\n\n`;
    fileContent += "This log contains details of your recent runs, formatted for analysis and training recommendations.\n\n";

    fileContent += "## 🏃 Recent Activities\n";
    fileContent += "| Date | Name | Type | Distance (km) | Time | Pace | Avg HR | Max HR | Elevation Gain (m) | Effort |\n";
    fileContent += "|------|------|------|--------------|------|------|--------|--------|----------------|--------|\n";

    runs.forEach(run => {
      fileContent += `| ${run.date} | ${run.name} | ${run.type} | ${run.distance_km} | ${run.moving_time} | ${run.pace} | ${run.avg_hr} | ${run.max_hr} | ${run.elevation_gain_m} | ${run.perceived_effort} |\n`;
    });

    fileContent += "\n## 📈 Splits Per Activity\n";
    runs.forEach(run => {
      if (Array.isArray(run.splits) && run.splits.length > 0) {
        fileContent += `### ${run.name} (${run.date})\n`;
        fileContent += "| Split | Distance (km) | Time | Pace |\n";
        fileContent += "|-------|--------------|------|------|\n";
        run.splits.forEach(split => {
          fileContent += `| ${split.split_number} | ${split.distance_km} | ${split.time} | ${split.pace} |\n`;
        });
        fileContent += "\n";
      }
    });

    fileContent += "\n## 📌 Instructions for ChatGPT\n";
    fileContent += "Use this training log to analyze trends and suggest adjustments based on heart rate, pace, elevation, and effort levels.\n";

    // Convert to Blob and create a download link
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Strava_Training_Log.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">🏃‍♂️ Strava Dashboard</h1>

      {runs.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center w-full max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Your Last {runs.length} Activities</h2>
          <button
            onClick={downloadRunSummary}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            📥 Download Training Log
          </button>
        </div>
      ) : (
        <p className="text-gray-600">Loading activities...</p>
      )}
    </div>
  );
}
