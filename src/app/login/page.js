"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-surface-container rounded-lg border border-outline-variant p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded bg-primary-container flex items-center justify-center border border-outline-variant mb-3">
            <MaterialIcon name="blur_on" className="text-primary" size={24} />
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">AlphaEdge Capital</h1>
          <p className="text-label-uppercase text-on-surface-variant mt-1">Institutional Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-label-uppercase text-on-surface-variant mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary text-on-surface"
              />
            </div>
          )}
          <div>
            <label className="block text-label-uppercase text-on-surface-variant mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary text-on-surface"
            />
          </div>
          <div>
            <label className="block text-label-uppercase text-on-surface-variant mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background border border-outline-variant rounded px-3 py-2.5 text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary text-on-surface"
            />
          </div>

          {error && <p className="text-error text-body-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-container text-on-secondary-container font-medium py-2.5 rounded text-label-uppercase disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In to Terminal"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            {isRegister ? "Already have an account? Sign in" : "New user? Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
