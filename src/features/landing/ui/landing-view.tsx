"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "./landing-header";
import {
  CheckCircle2,
  ChevronRight,
  FileAudio,
  Headphones,
  Languages,
  Layers,
  MessageSquareText,
  Mic,
  Play,
  Sparkles,
  Timer,
  Users,
  Wand2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WorkInProgressBanner } from "@/components/work-in-progress";

export function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingHeader />
      <WorkInProgressBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_30%,rgba(20,184,166,0.1),transparent)]" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={0}
              className="flex flex-col gap-4"
            >
              <Badge className="w-fit bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors">
                <Sparkles className="mr-1 h-3 w-3" />
                Powered by AI
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                Transform Speech to Text with{" "}
                <span className="text-teal-600 dark:text-teal-400">
                  Precision
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-[600px]">
                Skriptor converts your audio into accurate transcriptions in
                seconds. Perfect for meetings, interviews, lectures, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  Get Started Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                  <Play className="ml-1 h-4 w-4" />
                </Button>
              </div>
              {/* <div className="flex items-center gap-4 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="inline-block h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200 dark:bg-slate-800"
                    >
                      <Image
                        src={`/placeholder.svg?height=32&width=32&text=${i}`}
                        alt={`User ${i}`}
                        width={32}
                        height={32}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">4,000+</span> happy users
                </p>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-4 w-4 fill-current text-yellow-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    4.9/5
                  </span>
                </div>
              </div> */}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto lg:mr-0 w-full max-w-[600px] aspect-video rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-slate-900/40 z-10" />
              <div
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                onClick={() => setIsVideoPlaying(true)}
              >
                {!isVideoPlaying && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center h-16 w-16 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-lg"
                  >
                    <Play className="h-6 w-6 text-teal-600 dark:text-teal-400 ml-1" />
                  </motion.div>
                )}
              </div>
              {isVideoPlaying ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <Image
                  src="/main-text.png?height=400&width=600&text=Skriptor+Demo"
                  alt="Demo Video Thumbnail"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      {/* <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">
              TRUSTED BY COMPANIES WORLDWIDE
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 grayscale opacity-70">
              {["Google", "Microsoft", "Spotify", "Airbnb", "Amazon"].map(
                (company) => (
                  <div
                    key={company}
                    className="flex items-center justify-center"
                  >
                    <span className="text-xl font-semibold text-slate-400 dark:text-slate-600">
                      {company}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={0}
            >
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                Everything You Need for Perfect Transcriptions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                Our powerful features make transcribing audio effortless,
                accurate, and efficient.
              </p>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <Mic className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: "High Accuracy Transcription",
                description:
                  "Industry-leading speech recognition with 98.7% accuracy across accents and languages.",
              },
              {
                icon: (
                  <Timer className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: "Real-time Processing",
                description:
                  "Get your transcriptions in seconds, not hours. Perfect for time-sensitive content.",
              },
              {
                icon: (
                  <Languages className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: "Multi-language Support",
                description:
                  "Support for 30+ languages and automatic language detection for multilingual content.",
              },
              {
                icon: (
                  <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: "Speaker Identification",
                description:
                  "Automatically identify and label different speakers in your recordings.",
              },
              {
                icon: (
                  <MessageSquareText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: "Smart Summaries",
                description:
                  "AI-powered summaries of your transcriptions to quickly extract key information.",
              },
              {
                icon: (
                  <Wand2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: "Custom Vocabulary",
                description:
                  "Add industry-specific terms and names to improve transcription accuracy.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
              >
                <Card className="h-full border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={0}
            >
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30">
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                Simple Process, Powerful Results
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                Get accurate transcriptions in three easy steps
              </p>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: (
                  <FileAudio className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                ),
                title: "Upload Your Audio",
                description:
                  "Upload audio files or record directly in your browser. We support MP3, WAV, M4A, and more.",
              },
              {
                step: "02",
                icon: (
                  <Layers className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                ),
                title: "AI Processing",
                description:
                  "Our advanced AI analyzes your audio, identifies speakers, and transcribes with high accuracy.",
              },
              {
                step: "03",
                icon: (
                  <Headphones className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                ),
                title: "Review & Export",
                description:
                  "Edit your transcript if needed, then export in various formats including TXT, DOCX, and SRT.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
                className="relative"
              >
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="absolute -top-5 flex items-center justify-center h-10 w-10 rounded-full bg-teal-600 text-white font-bold">
                    {step.step}
                  </div>
                  <div className="mt-6 mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">
                    <ChevronRight className="h-8 w-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={0}
            >
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30">
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                What Our Users Say
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                Join thousands of satisfied users who trust Skriptor for their
                transcription needs
              </p>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "Skriptor has completely transformed how we handle meeting notes. The accuracy is incredible, and it saves us hours every week.",
                author: "Sarah Johnson",
                role: "Product Manager at TechCorp",
                avatar: "/placeholder.svg?height=64&width=64&text=SJ",
              },
              {
                quote:
                  "As a journalist, accurate transcriptions are essential. Skriptor delivers consistently excellent results, even with challenging audio.",
                author: "Michael Chen",
                role: "Senior Reporter, Global News",
                avatar: "/placeholder.svg?height=64&width=64&text=MC",
              },
              {
                quote:
                  "The speaker identification feature is a game-changer for our podcast editing workflow. We've cut post-production time in half!",
                author: "Alex Rivera",
                role: "Podcast Producer",
                avatar: "/placeholder.svg?height=64&width=64&text=AR",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
              >
                <Card className="h-full border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex-1">
                      <svg
                        className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                      </svg>
                      <p className="text-slate-600 dark:text-slate-400 italic mb-6">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {testimonial.author}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={0}
            >
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                Choose the plan that works best for you and your team
              </p>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for occasional use",
                features: [
                  "Up to 10 minutes of audio per month",
                  "Standard accuracy transcription",
                  "2 export formats",
                  "Email support",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Pro",
                price: "$12",
                period: "/month",
                description: "Ideal for regular users",
                features: [
                  "Up to 5 hours of audio per month",
                  "High accuracy transcription",
                  "Speaker identification",
                  "All export formats",
                  "Priority email support",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Business",
                price: "$49",
                period: "/month",
                description: "For teams and heavy users",
                features: [
                  "Up to 20 hours of audio per month",
                  "Highest accuracy transcription",
                  "Advanced speaker identification",
                  "Custom vocabulary",
                  "Team collaboration features",
                  "24/7 priority support",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
                className="flex"
              >
                <Card
                  className={`flex flex-col h-full border-slate-200 dark:border-slate-800 ${
                    plan.popular
                      ? "border-teal-600 dark:border-teal-400 shadow-lg relative"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline mb-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-slate-600 dark:text-slate-400">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2 shrink-0 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      className={`w-full mt-4 ${
                        plan.popular
                          ? "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={0}
            >
              <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                Everything you need to know about Skriptor
              </p>
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "How accurate is the transcription?",
                  answer:
                    "Skriptor achieves an industry-leading 98.7% accuracy rate for clear audio in supported languages. Accuracy may vary depending on audio quality, background noise, accents, and technical terminology.",
                },
                {
                  question: "What languages are supported?",
                  answer:
                    "Skriptor currently supports over 30 languages including English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, Arabic, and many more. We're constantly adding support for additional languages.",
                },
                {
                  question: "How long does transcription take?",
                  answer:
                    "Most transcriptions are completed in near real-time. A 60-minute audio file typically takes 2-3 minutes to process, depending on audio quality and server load.",
                },
                {
                  question: "Is my data secure?",
                  answer:
                    "Yes, we take data security very seriously. All uploads are encrypted using TLS, and we use industry-standard security practices to protect your data. We do not share your content with third parties, and you can delete your data at any time.",
                },
                {
                  question: "Can I edit the transcriptions?",
                  answer:
                    "Our editor allows you to make corrections, add speaker labels, and format your transcript. Changes are saved automatically as you type.",
                },
                {
                  question: "What file formats are supported?",
                  answer:
                    "Skriptor supports most common audio formats including MP3, WAV, M4A, FLAC, OGG, and more. You can also record directly in your browser or upload video files (MP4, MOV, AVI).",
                },
              ].map((faq, i) => (
                <motion.div
                  key={faq.question}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  custom={i}
                >
                  <AccordionItem
                    value={`item-${i}`}
                    className="border-b border-slate-200 dark:border-slate-800"
                  >
                    <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-teal-500 to-teal-700 dark:from-teal-800 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={0}
              className="max-w-[800px]"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                Ready to Transform Your Audio into Text?
              </h2>
              <p className="text-lg text-teal-100 mb-8">
                Join thousands of satisfied users who save time and improve
                productivity with Skriptor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  Get Started Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-teal-600/20"
                >
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Headphones className="h-6 w-6 text-teal-400" />
                <span className="font-medium text-lg text-white">Skriptor</span>
              </div>
              <p className="text-slate-400 mb-4">
                Transform speech to text with precision and ease.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Licenses
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">
              © 2023 Skriptor. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <select className="bg-slate-800 text-slate-300 text-sm rounded-md px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
