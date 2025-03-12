

export default function Home() {
  return (
    <div>
      <h1>Strava Training Log Downloader</h1>
      <a href="/api/strava/auth">
        <button
          style={{
            backgroundColor: "#fc5200",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Connect Strava
        </button>
      </a>
    </div>
  );
}
