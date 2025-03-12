import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

// ✅ Define the expected shape of the Strava user object
interface User {
  profile: string;
  firstname: string;
  lastname: string;
  country: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { access_token } = router.query;
  const [user, setUser] = useState<User | null>(null); // 👈 Explicitly define the state type

  useEffect(() => {
    if (!access_token) return;

    async function fetchUserData() {
      try {
        const res = await fetch(`/api/strava/user?access_token=${access_token}`);
        const data: User = await res.json(); // 👈 Tell TypeScript what to expect
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }

    fetchUserData();
  }, [access_token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">🏃‍♂️ Strava Dashboard</h1>

      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">          
          <Image
            src={user.profile}
            alt="Profile"
            width={96} // Same as "w-24"
            height={96} // Same as "h-24"
            className="rounded-full mb-4"
            />

          <h2 className="text-lg font-semibold">{user.firstname} {user.lastname}</h2>
          <p className="text-gray-600">{user.country}</p>
        </div>
      ) : (
        <p className="text-gray-600">Loading user data...</p>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Back to Home
      </button>
    </div>
  );
}