'use client';

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./Input";
import { Button } from "./Button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextError = searchParams?.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState<string | null>(nextError ? mapError(nextError) : null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });
    // We expect a redirect; if for some reason it doesn't happen, stop loading.
    setLoading(false);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

function mapError(code: string) {
  if (code === "CredentialsSignin") return "Invalid email or password";
  return "Unable to sign in. Please try again.";
}
