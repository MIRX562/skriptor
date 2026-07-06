import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingPage } from "../landing-view";
import { LandingHeader } from "../landing-header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Setup TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// Mock dict structure
const mockDict = {
  common: {
    navigation: { features: "Features", pricing: "Pricing", docs: "Docs" },
  },
  landing: {
    header: {
      features: "Features",
      pricing: "Pricing",
      testimonials: "Testimonials",
      faq: "FAQ",
      architecture: "Architecture",
      dashboard: "Dashboard",
      login: "Log in",
      signup: "Sign up"
    },
    hero: {
      badge: "New Release",
      titlePart1: "Convert your voice to",
      titleHighlight: "perfect text",
      description: "Fast multi-language speech-to-text platform.",
      getStarted: "Get Started",
      viewDemo: "View Demo",
    },
    features: {
      badge: "Features",
      title: "Core Features",
      description: "Everything you need.",
      items: {
        accuracy: { title: "High Accuracy", description: "Near human accuracy" },
        realtime: { title: "Real-time SSE", description: "Stream status updates" },
        languages: { title: "Multi-Language", description: "Over 30 languages" },
        speakers: { title: "Diarization", description: "Identify multiple speakers" },
        summaries: { title: "AI Summary", description: "Auto summaries" },
        vocabulary: { title: "Glossaries", description: "Add custom words" },
      },
    },
    howItWorks: {
      badge: "Workflow",
      title: "How it Works",
      description: "Three simple steps.",
      steps: {
        upload: { title: "Upload Audio", description: "Drag and drop files" },
        process: { title: "Whisper Processing", description: "Queued transcription" },
        review: { title: "Review & Correct", description: "Edit and export text" },
      },
    },
    faq: {
      badge: "FAQ",
      title: "Frequently Asked Questions",
      description: "Common questions answered.",
      items: [
        { question: "Is it secure?", answer: "Yes, fully encrypted." },
      ],
    },
    cta: {
      title: "Ready to start?",
      description: "Get started today.",
      getStarted: "Try Skriptor Free",
      contactSales: "Contact Sales",
    },
    footer: {
      description: "Modern voice transcription platform.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      rights: "All rights reserved.",
      links: {
        api: "API Access",
        integrations: "Integrations",
        documentation: "Documentation",
        architecture: "Architecture Map",
        about: "About Us",
        blog: "Blog",
        careers: "Careers",
        press: "Press Info",
        contact: "Get in Touch",
        terms: "Terms of Service",
        privacy: "Privacy Policy",
        cookies: "Cookie Settings",
        licenses: "Licenses",
        settings: "Profile Settings",
      },
    },
    liteForm: {
      title: "Try Free",
      uploadAudio: "Upload audio",
      actions: { transcribe: "Transcribe", transcribing: "Processing..." },
      supportedFormats: "MP3, WAV",
      tabs: {
        upload: "Upload File",
        record: "Record Audio"
      },
      uploadArea: {
        clickToUpload: "Click to upload",
        orDragAndDrop: "or drag and drop",
        hint: "MP3, M4A, WAV, FLAC (Max 50MB)"
      },
      audioPreview: "Audio Preview",
      submit: "Transcribe Now",
      processing: "Processing...",
      messages: {
        noFile: "Please provide an audio file to transcribe.",
        authRequired: "Please sign up or log in to continue.",
        uploadFailed: "Upload failed.",
        started: "Transcription started successfully."
      }
    },
  },
};

describe("LandingPage UI Components", () => {
  it("renders LandingHeader with navigation links", () => {
    render(<LandingHeader locale="en" dict={mockDict} />);
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
  });

  it("renders LandingPage hero section and form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LandingPage locale="en" dict={mockDict} />
      </QueryClientProvider>
    );

    // Hero content checks
    expect(screen.getByText("New Release")).toBeInTheDocument();
    expect(screen.getByText("Convert your voice to")).toBeInTheDocument();
    expect(screen.getByText("Try Free")).toBeInTheDocument();
    
    // Core features section checks
    expect(screen.getByText("High Accuracy")).toBeInTheDocument();
    expect(screen.getByText("Real-time SSE")).toBeInTheDocument();
  });
});
