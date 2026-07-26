import { ArchitectureDiagram } from "@/features/architecture/ui/architecture-diagram";
import { AuthFlow } from "@/features/architecture/ui/auth-flow";
import { JobQueueFlow } from "@/features/architecture/ui/job-queue-flow";
import { BenchmarkFlow } from "@/features/architecture/ui/benchmark-flow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Share2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Architecture | Skriptor",
  description:
    "Explore the technical architecture of Skriptor's AI transcription engine.",
};

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-teal-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-white/50 hover:text-white hover:bg-white/5 -ml-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                  System <span className="text-teal-400">Architecture</span>
                </h1>
                <Badge
                  variant="outline"
                  className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
                >
                  v1.0.0-stable
                </Badge>
              </div>
              <p className="text-lg text-white/40 max-w-2xl font-medium leading-relaxed">
                Precise system-level diagrams for topology, authentication
                internals, asynchronous queue lifecycle, and benchmark
                evaluation pipeline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 hover:bg-white/10 gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Specs
            </Button>
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-600 text-black font-bold gap-2"
            >
              <Info className="w-4 h-4" />
              Full Documentation
            </Button>
          </div>
        </header>

        <section className="space-y-14">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tighter">
                Overall <span className="text-teal-400">Architecture</span>
              </h2>
              <Badge
                variant="outline"
                className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
              >
                Web + Postgres + Redis + MinIO + Worker
              </Badge>
            </div>
            <p className="text-sm text-white/40 max-w-3xl font-medium leading-relaxed">
              High-level topology constrained to the five primary runtime
              components and their production data paths.
            </p>
            <ArchitectureDiagram />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tighter">
                Better Auth{" "}
                <span className="text-emerald-400">Architecture</span>
              </h2>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
              >
                Drizzle + Redis + Resend + OAuth
              </Badge>
            </div>
            <p className="text-sm text-white/40 max-w-3xl font-medium leading-relaxed">
              Derived from current `lib/auth.ts`: Better Auth uses PostgreSQL
              via Drizzle adapter, Redis as secondary storage and rate-limit
              backing store, Resend for verification email delivery, Google
              OAuth as optional social login, and cookie sessions through
              `nextCookies` plugin.
            </p>
            <AuthFlow />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tighter">
                Job Queue <span className="text-orange-400">Lifecycle</span>
              </h2>
              <Badge
                variant="outline"
                className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
              >
                Creation → Completed
              </Badge>
            </div>
            <p className="text-sm text-white/40 max-w-3xl font-medium leading-relaxed">
              End-to-end asynchronous flow from presigned upload and queue
              creation, through worker execution and live progress, until signed
              callback verification and final persistence.
            </p>
            <JobQueueFlow />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tighter">
                Benchmarking <span className="text-purple-400">Pipeline</span>
              </h2>
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
              >
                Performance Metrics
              </Badge>
            </div>
            <p className="text-sm text-white/40 max-w-3xl font-medium leading-relaxed">
              Script-accurate flow from device probing and dataset loading to
              model loop evaluation, metric aggregation, JSON output, and
              Streamlit visualization.
            </p>
            <BenchmarkFlow />
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">
          <div>© 2026 Skriptor Infrastructure</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Performance
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Uptime
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
