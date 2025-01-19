import { DnsAnalyzer } from "@/components/dns-analyzer"
import { SiteHeader } from "@/components/site-header"
import { SparklesCore } from "@/components/ui/sparkles"
import { MorphingText } from "@/components/ui/morphing-text"
import {BackgroundBeams } from "@/components/ui/background-beams"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { HoverEffect } from "@/components/ui/card-hover-effect"

const features = [
  {
    title: "Comprehensive Analysis",
    description: "Deep dive into DNS records, security issues, and configuration details",
    icon: "🔍"
  },
  {
    title: "Security Scanning",
    description: "Identify potential vulnerabilities and misconfigurations in your DNS setup",
    icon: "🛡️"
  },
  {
    title: "Cloud Service Detection",
    description: "Automatically detect and map cloud service integrations",
    icon: "☁️"
  },
  {
    title: "Email Configuration",
    description: "Validate SPF, DKIM, and DMARC records for email security",
    icon: "📧"
  }
];

const words = [
  "DNS Analysis Made Simple",
  "Secure Your DNS Setup",
  "Detect Configuration Issues",
  "Optimize DNS Performance"
];

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-30 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
      <div className="absolute inset-0 -z-20">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
        <BackgroundBeams className="opacity-80" />
      </div>

      <div className="relative z-10">
        <SiteHeader />
        
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <MorphingText 
              texts={words}
              className="text-white text-4xl md:text-6xl font-bold"
            />
            <p className="text-xl text-white/60 mt-8">
              Powerful DNS zone file analysis with advanced security insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-50/10 to-white/5 p-px hover:from-neutral-50/15 hover:to-white/10 transition-all duration-500"
              >
                <div className="relative h-full bg-gradient-to-b from-black/80 via-black/50 to-black/80 backdrop-blur-3xl rounded-3xl p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60 flex-grow">{feature.description}</p>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-transparent blur-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10">
            <DnsAnalyzer />
          </div>

          <footer className="mt-24 text-center text-white/60">
            <p>Brought to you by the DNS security experts</p>
          </footer>
        </main>
      </div>
    </div>
  )
}

