"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { FadeIn, Stagger, StaggerItem, MotionButton } from "@/components/motion";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const authHighlights = [
    { icon: "shield", title: "Secure access", text: "Encrypted sessions and guarded terminal access." },
    { icon: "insights", title: "Real-time signal flow", text: "Live market intelligence and portfolio context." },
    { icon: "bolt", title: "Fast workflow", text: "One-screen entry into the trading terminal." },
  ];

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
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-[#08111F] via-[#0B1627] to-[#07101C]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18)_0%,transparent_32%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.12)_0%,transparent_28%),radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.08)_0%,transparent_24%)]" />

      <div className="relative min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-10 items-center">
        <FadeIn>
          <motion.section
            className="glass-elevated rounded-3xl p-8 sm:p-10 lg:p-12 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-label-sm text-on-surface-variant mb-6">
              <MaterialIcon name="verified" size={16} className="text-secondary" />
              Institutional access
            </div>

            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.08 }}
              >
                <MaterialIcon name="blur_on" className="text-on-primary" size={28} />
              </motion.div>
              <div>
                <h1 className="text-headline-lg sm:text-display-sm font-bold text-on-surface">AlphaEdge Capital</h1>
                <p className="text-body-sm text-on-surface-variant mt-1">Institutional terminal for live market intelligence and execution.</p>
              </div>
            </div>

            {/* <div className="space-y-5 mb-8">
              <h2 className="text-display-sm sm:text-display-md font-bold text-gradient-primary leading-tight max-w-xl">
                Sign in to your trading workspace.
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-xl">
                Access live market views, portfolio summaries, and AI-driven insights from a single secure terminal.
              </p>
            </div> */}

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {[
                { value: "24/7", label: "Availability" },
                { value: "Live", label: "Market data" },
                { value: "RL", label: "AI engine" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-headline-sm font-bold text-on-surface">{item.value}</div>
                  <div className="text-label-sm text-on-surface-variant mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {authHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-container/40 px-4 py-4">
                  <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                    <MaterialIcon name={item.icon} size={20} className="text-secondary" />
                  </div>
                  <div>
                    <div className="text-title-md font-semibold text-on-surface">{item.title}</div>
                    <p className="text-body-sm text-on-surface-variant mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </FadeIn>

        <FadeIn>
          <motion.section
            className="glass-surface rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.05 }}
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-label-sm text-on-surface-variant">Welcome back</p>
                <h3 className="text-headline-md font-bold text-on-surface mt-1">{isRegister ? "Create your account" : "Sign in"}</h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-label-sm text-on-surface-variant">
                <MaterialIcon name="lock" size={16} className="text-secondary" />
                Secure session
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Stagger className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {isRegister && (
                    <StaggerItem key="name-field">
                      <div>
                        <label className="block text-label-sm text-on-surface-variant mb-2">Name</label>
                        <div className="relative">
                          <MaterialIcon name="person" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-background/70 pl-11 pr-4 py-3.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>
                    </StaggerItem>
                  )}
                </AnimatePresence>

                <StaggerItem>
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-2">Email</label>
                    <div className="relative">
                      <MaterialIcon name="mail" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-background/70 pl-11 pr-4 py-3.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                        placeholder="name@firm.com"
                      />
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-2">Password</label>
                    <div className="relative">
                      <MaterialIcon name="key" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-background/70 pl-11 pr-4 py-3.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </StaggerItem>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      className="rounded-2xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-error text-body-sm"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <StaggerItem>
                  <MotionButton
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-primary px-4 py-3.5 text-on-primary text-label-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "Processing..." : isRegister ? "Create account" : "Sign in"}
                  </MotionButton>
                </StaggerItem>
              </Stagger>
            </form>

            <div className="mt-5 text-center">
              <MotionButton
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-secondary transition-colors bg-transparent border-none"
              >
                <MaterialIcon name="swap_horiz" size={16} />
                {isRegister ? "Already have an account? Sign in" : "New user? Create account"}
              </MotionButton>
            </div>

            <div className="mt-8 pt-6 border-t border-white/8 flex items-center justify-between gap-3 text-body-xs text-on-surface-variant">
              <span>Enterprise-grade access</span>
              <span>Protected session flow</span>
            </div>
          </motion.section>
        </FadeIn>
      </div>
    </div>
  );
}
