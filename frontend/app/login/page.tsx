"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="p-4">
      {session ? (
        <>
          <p>Signed in as {session.user?.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick={() => signIn()}>Sign in</button>
      )}
    </div>
  );
}
