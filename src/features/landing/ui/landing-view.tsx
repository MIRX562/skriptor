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
import { LiteTranscriptionForm } from "./lite-transcription-form";
import SoftAurora from "@/components/SoftAurora";
import GradientText from "@/components/GradientText";
import { LanguageSwitcher } from "@/components/language-switcher";
import Logo from "@/components/logo";

export function LandingPage({ locale, dict }: { locale: string; dict: any }) {

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingHeader locale={locale} dict={dict} />
      <WorkInProgressBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-6 md:py-12 min-h-[700px] flex items-center bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="absolute inset-0 z-0">
          <SoftAurora
            lightColor1="#5eead4" // teal-300
            lightColor2="#0d9488" // teal-600
            darkColor1="#2dd4bf"  // teal-400
            darkColor2="#115e59"  // teal-800
            brightness={1.2}
            speed={0.5}
            enableMouseInteraction={false}
          />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
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
                {dict.landing.hero.badge}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {dict.landing.hero.titlePart1}{" "}
                <GradientText
                  className="inline-flex"
                  colors={["#0d9488", "#2dd4bf", "#5eead4"]}
                  animationSpeed={5}
                >
                  {dict.landing.hero.titleHighlight}
                </GradientText>
              </h1>
              {dict.landing.hero.description}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  {dict.landing.hero.getStarted}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  {dict.landing.hero.viewDemo}
                  <Play className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto lg:mr-0 w-full max-w-[600px] z-10 mt-8 lg:mt-0"
            >
              <LiteTranscriptionForm
                dict={dict.landing.liteForm}
                common={dict.common}
                fullDict={dict}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-950">
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
                {dict.landing.features.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                {dict.landing.features.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                {dict.landing.features.description}
              </p>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <Mic className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.features.items.accuracy.title,
                description: dict.landing.features.items.accuracy.description,
              },
              {
                icon: (
                  <Timer className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.features.items.realtime.title,
                description: dict.landing.features.items.realtime.description,
              },
              {
                icon: (
                  <Languages className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.features.items.languages.title,
                description: dict.landing.features.items.languages.description,
              },
              {
                icon: (
                  <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.features.items.speakers.title,
                description: dict.landing.features.items.speakers.description,
              },
              {
                icon: (
                  <MessageSquareText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.features.items.summaries.title,
                description: dict.landing.features.items.summaries.description,
              },
              {
                icon: (
                  <Wand2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.features.items.vocabulary.title,
                description: dict.landing.features.items.vocabulary.description,
              },
            ].map((feature: any, i: number) => (
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
      <section id="how-it-works" className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900">
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
                {dict.landing.howItWorks.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                {dict.landing.howItWorks.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                {dict.landing.howItWorks.description}
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
                title: dict.landing.howItWorks.steps.upload.title,
                description: dict.landing.howItWorks.steps.upload.description,
              },
              {
                step: "02",
                icon: (
                  <Layers className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.howItWorks.steps.process.title,
                description: dict.landing.howItWorks.steps.process.description,
              },
              {
                step: "03",
                icon: (
                  <Headphones className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                ),
                title: dict.landing.howItWorks.steps.review.title,
                description: dict.landing.howItWorks.steps.review.description,
              },
            ].map((step: any, i: number) => (
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-white dark:bg-slate-950">
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
                {dict.landing.faq.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                {dict.landing.faq.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[800px] mx-auto">
                {dict.landing.faq.description}
              </p>
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {dict.landing.faq.items.map((faq: any, i: number) => (
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
                {dict.landing.cta.title}
              </h2>
              <p className="text-lg text-teal-100 mb-8">
                {dict.landing.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  {dict.landing.cta.getStarted}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-teal-600/20"
                >
                  {dict.landing.cta.contactSales}
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
                <Logo />
                <span className="font-medium text-lg text-white">Skriptor</span>
              </div>
              <p className="text-slate-400 mb-4">
                {dict.landing.footer.description}
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
              <h3 className="font-semibold text-white mb-4">{dict.landing.footer.product}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.header.features}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.header.pricing}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.api}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.integrations}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.documentation}
                  </Link>
                </li>
                <li>
                  <Link href="/architecture" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.architecture}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{dict.landing.footer.company}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.about}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.blog}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.careers}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.press}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.contact}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{dict.landing.footer.legal}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.terms}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.cookies}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.licenses}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {dict.landing.footer.links.settings}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">
              {dict.landing.footer.rights}
            </p>
            <div className="mt-4 md:mt-0">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
