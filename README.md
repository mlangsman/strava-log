# Strava Log

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Strava](https://img.shields.io/badge/Strava-API-FC4C02?style=flat&logo=strava&logoColor=white)

Connect your Strava account and download your recent runs as a clean training log you can hand straight to an AI coach.

## Why I built it

I'm a runner, and I'd started asking ChatGPT for feedback on my training. The advice was only as good as the data I gave it, and copying runs out of Strava one at a time was slow and messy.

So I built a small tool to do it for me. It pulls my last 30 activities from the Strava API and turns them into one tidy file with pace, heart rate, elevation, effort and splits. I paste that into a chat and ask what to change.

It was also a good excuse to learn OAuth properly and get hands-on with the Next.js API routes.

## What it does

1. **Connect Strava.** You sign in with Strava's OAuth flow and grant read access to your activities.
2. **Fetch your runs.** A server-side API route gets your last 30 activities, then fetches the detail for each one to get the splits.
3. **Tidy the data.** Raw Strava values (metres, seconds) become things a person or a model can read: distance in km, time in minutes, pace in min/km, average and max heart rate, elevation gain and Strava's relative effort score.
4. **Download the log.** One click gives you a Markdown-formatted text file with a summary table, a splits table for each run and a short prompt telling the AI what to look for.

Here's a trimmed example of the output:

```markdown
# Strava Training Log 📊

## 🏃 Recent Activities
| Date       | Name          | Type | Distance (km) | Time          | Pace          | Avg HR | Max HR | Elevation Gain (m) | Effort |
|------------|---------------|------|---------------|---------------|---------------|--------|--------|--------------------|--------|
| 2025-03-10 | Morning Run   | Run  | 8.02          | 42 min 15 sec | 5.27 min/km   | 148.2  | 171    | 64                 | 38     |

## 📌 Instructions for ChatGPT
Use this training log to analyze trends and suggest adjustments based on heart rate, pace, elevation, and effort levels.
```

## How it's built

- **Next.js 15 (Pages Router) with React 19 and TypeScript.** The UI and the backend live in one project. The pages handle the front end, and `src/pages/api/strava/` holds the server routes that talk to Strava.
- **OAuth 2.0 with Strava.** `auth.ts` sends you to Strava to sign in, and `callback.ts` swaps the code Strava returns for an access token.
- **Token refresh.** Strava access tokens expire after six hours. `token.ts` checks the expiry and uses the refresh token to get a new one when it needs to.
- **Parallel fetching.** Getting splits means one extra request per activity, so `activities.ts` runs them together with `Promise.all` rather than one after another.
- **Tailwind CSS 4** for styling.

```
src/pages/
├── index.tsx              # Landing page with the "Connect Strava" button
├── dashboard.tsx          # Loads your runs and builds the downloadable log
└── api/strava/
    ├── auth.ts            # Redirects to Strava's OAuth screen
    ├── callback.ts        # Exchanges the auth code for an access token
    ├── token.ts           # Refreshes the access token when it expires
    ├── activities.ts      # Fetches and formats your last 30 activities
    └── user.ts            # Fetches your athlete profile
```

## Run it locally

You'll need Node.js 18+ and a Strava API app. You can create one at [strava.com/settings/api](https://www.strava.com/settings/api). Set its **Authorization Callback Domain** to `localhost`.

```bash
git clone https://github.com/mlangsman/strava-log.git
cd strava-log
npm install
```

Create a `.env.local` file in the project root:

```bash
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
STRAVA_REFRESH_TOKEN=your_refresh_token
```

Then start the dev server and open [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

## What I'd do next

This started as a personal tool, so it's set up for one athlete: me. Before other people could use it I'd want to:

- **Handle tokens per user.** Store each athlete's tokens in a secure session instead of reading one refresh token from the environment.
- **Keep tokens out of the URL.** The access token is currently passed to the dashboard as a query string, which is fine locally but not in production.
- **Show the runs on screen.** Right now the dashboard only offers the download. A table and a few charts would make it useful on its own.
- **Let you choose the date range** instead of always taking the last 30 activities.
- **Connect it to an AI model directly** so you get coaching feedback in the app without the copy and paste.
