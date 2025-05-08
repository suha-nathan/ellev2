"use client";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LearningPlansPage() {
  const { data: session, status } = useSession();
  const { data, error } = useSWR("/api/learning-plans", fetcher);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>Please sign in to view your learning plans.</p>;
  if (error) return <p>Failed to load learning plans</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Your Learning Plans</h1>
      <ul className="mt-4 space-y-4">
        {data?.plans?.map((plan: any) => (
          <li key={plan.planId} className="border rounded p-4">
            <h2 className="text-lg font-medium">{plan.title}</h2>
            <p className="text-sm text-gray-600">{plan.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
