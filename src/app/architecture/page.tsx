import { ArchitectureDiagram } from "@/features/architecture/ui/architecture-diagram";
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
        <section className="space-y-6">
          <ArchitectureDiagram />
          
          {/* Legend / Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-teal-400 mb-2 uppercase tracking-widest">Next.js 16 Edge</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Leveraging Partial Prerendering (PPR) and React 19 Server Components for instant load times and efficient data streaming via SSE.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-widest">WhisperX Worker</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Distributed Python workers handle heavy lifting: transcription, forced alignment, and diarization using optimized Whisper models.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h4 className="text-sm font-bold text-orange-400 mb-2 uppercase tracking-widest">Real-time Pipeline</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                BullMQ manages the job lifecycle, while Redis Pub/Sub ensures low-latency progress updates are streamed back to the user interface.
              </p>
            </div>
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
