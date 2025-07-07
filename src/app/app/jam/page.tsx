"use client";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Jam() {
  const {userData, createJam, jams, loading } = useAuth();
  const router = useRouter();

  const handleCreateJam = async () => {
    const newJamId = await createJam();
    if (newJamId) {
      // Redirect to the new jam board page
      router.push(`/jam/${newJamId}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Jams</h1>
        <button
          onClick={handleCreateJam}
          className=" bg-amber-500 px-2 text-lg text-white font-semibold rounded-md hover:bg-amber-600 transition-colors"
        >
          Create
        </button>
      </div>

      {!loading &&
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {jams.length > 0 ? (
            jams.map((jam) => (
              <Link key={jam.id} href={`/jamLink/${jam.id}`}>
                <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
                  <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
                    {jam.title}
                  </h5>

                  <div className="">
                    {jam.authorId == userData?.uid ?
                      (
                        <p className="font-normal text-gray-500 dark:text-gray-400">By: You</p>
                      ):
                      (
                        <p className="font-normal text-gray-500 dark:text-gray-400 w-full truncate">
                          By: {jam.authorUsername}
                        </p>
                      )
                    }

                    <p className="font-normal text-gray-500 w-full dark:text-gray-400">
                      Last modified:{" "}
                      {new Date(jam.lastModified?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-gray-500">
              You haven&apos;t created any jams yet.
            </p>
          )}
        </div>
      }
    </div>
  );
}