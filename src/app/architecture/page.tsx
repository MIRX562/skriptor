import { ArchitectureDiagram } from "@/features/architecture/ui/architecture-diagram";
import { BenchmarkFlow } from "@/features/architecture/ui/benchmark-flow";
import { WhisperXFlow } from "@/features/architecture/ui/whisperx-flow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Share2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Architecture | Skriptor",
  description: "Explore the technical architecture of Skriptor's AI transcription engine.",
};

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-teal-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-white/50 hover:text-white hover:bg-white/5 -ml-3">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                  System <span className="text-teal-400">Architecture</span>
                </h1>
                <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                  v1.0.0-stable
                </Badge>
              </div>
              <p className="text-lg text-white/40 max-w-2xl font-medium leading-relaxed">
                A high-level technical overview of how Skriptor processes audio at scale. 
                From client-side uploads to distributed AI workers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 gap-2">
              <Share2 className="w-4 h-4" />
              Share Specs
            </Button>
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-black font-bold gap-2">
              <Info className="w-4 h-4" />
              Full Documentation
            </Button>
          </div>
        </header>

        {/* Diagram Section */}
        <section className="space-y-12">
          <ArchitectureDiagram />
          
          {/* Legend / Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-teal-400 mb-4 uppercase tracking-widest">Next.js Stack</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">Next.js 16 + React 19</span>
                  <p className="text-white/40 leading-relaxed">Core framework leveraging PPR and Server Components for instant load times.</p>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">Better-Auth v1</span>
                  <p className="text-white/40 leading-relaxed">Secure ownership-based authentication and multi-provider session management.</p>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">Drizzle ORM + Zod</span>
                  <p className="text-white/40 leading-relaxed">Type-safe database interactions and runtime schema validation.</p>
                </li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-widest">Memory & Storage</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">PostgreSQL</span>
                  <p className="text-white/40 leading-relaxed">Primary relational storage for user data, transcriptions, and segments.</p>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">Garage (S3 Compatible)</span>
                  <p className="text-white/40 leading-relaxed">Distributed object storage for audio files, ensuring high availability.</p>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">Redis + BullMQ</span>
                  <p className="text-white/40 leading-relaxed">Low-latency job queuing and real-time Pub/Sub for SSE progress streaming.</p>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-widest">Python Worker Stack</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">WhisperX AI Engine</span>
                  <p className="text-white/40 leading-relaxed">Distributed inference engine for transcription, alignment, and diarization.</p>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">PyTorch + CUDA</span>
                  <p className="text-white/40 leading-relaxed">GPU-accelerated tensor computations for high-throughput AI processing.</p>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/80 font-bold">BullMQ + UV</span>
                  <p className="text-white/40 leading-relaxed">Fast Python job workers with optimized dependency management.</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-12">
             <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tighter">
                  WhisperX <span className="text-blue-400">AI Pipeline</span>
                </h2>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                  Internal Processing
                </Badge>
              </div>
              <p className="text-sm text-white/40 max-w-2xl font-medium leading-relaxed">
                The internal modular stages of the WhisperX engine. This pipeline ensures word-level timestamp accuracy and speaker identification through a multi-stage neural network workflow.
              </p>
              <WhisperXFlow />
          </div>

          <div className="space-y-4 pt-12">
             <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tighter">
                  Benchmarking <span className="text-purple-400">Pipeline</span>
                </h2>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                  Performance Metrics
                </Badge>
              </div>
              <p className="text-sm text-white/40 max-w-2xl font-medium leading-relaxed">
                A specialized flow for performance testing, where distributed workers pull reference datasets to measure accuracy (WER/CER) and latency across different Whisper models.
              </p>
              <BenchmarkFlow />
          </div>
        </section>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">
          <div>© 2026 Skriptor Infrastructure</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Performance</a>
            <a href="#" className="hover:text-white transition-colors">Uptime</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
