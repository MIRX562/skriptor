import { Node, Edge } from "@xyflow/react";
import {
  Globe,
  ShieldCheck,
  Database,
  Zap,
  Mail,
  KeyRound,
  Cookie,
} from "lucide-react";

export const AUTH_NODES: Node[] = [
  {
    id: "a-browser",
    type: "custom",
    position: { x: 50, y: 260 },
    data: {
      label: "Browser",
      icon: Globe,
      type: "client",
      description: "Sign in / callback requests",
    },
  },
  {
    id: "a-better-auth",
    type: "custom",
    position: { x: 350, y: 260 },
    data: {
      label: "Better Auth API",
      icon: ShieldCheck,
      type: "server",
      description: "Email+password, OAuth, verification",
    },
  },
  {
    id: "a-postgres",
    type: "custom",
    position: { x: 700, y: 110 },
    data: {
      label: "PostgreSQL",
      icon: Database,
      type: "db",
      description: "user/account/session/verification tables",
    },
  },
  {
    id: "a-redis",
    type: "custom",
    position: { x: 700, y: 260 },
    data: {
      label: "Redis",
      icon: Zap,
      type: "queue",
      description: "secondaryStorage + rate-limit state",
    },
  },
  {
    id: "a-resend",
    type: "custom",
    position: { x: 700, y: 410 },
    data: {
      label: "Resend",
      icon: Mail,
      type: "server",
      description: "verification email delivery",
    },
  },
  {
    id: "a-google",
    type: "custom",
    position: { x: 1020, y: 180 },
    data: {
      label: "Google OAuth",
      icon: KeyRound,
      type: "server",
      description: "social provider",
    },
  },
  {
    id: "a-cookie",
    type: "custom",
    position: { x: 1020, y: 340 },
    data: {
      label: "Session Cookie",
      icon: Cookie,
      type: "storage",
      description: "nextCookies plugin",
    },
  },
];

export const AUTH_EDGES: Edge[] = [
  {
    id: "ae-1",
    source: "a-browser",
    target: "a-better-auth",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "sign-up / sign-in",
    data: { color: "#3b82f6" },
  },
  {
    id: "ae-2",
    source: "a-better-auth",
    target: "a-postgres",
    type: "packet",
    sourceHandle: "top-out",
    targetHandle: "left-in",
    label: "Drizzle adapter read/write",
    data: { color: "#8b5cf6" },
  },
  {
    id: "ae-3",
    source: "a-better-auth",
    target: "a-redis",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "secondaryStorage + rateLimit",
    data: { color: "#f97316" },
  },
  {
    id: "ae-4",
    source: "a-better-auth",
    target: "a-resend",
    type: "packet",
    sourceHandle: "bottom-out",
    targetHandle: "left-in",
    label: "sendVerificationEmail()",
    data: { color: "#14b8a6" },
  },
  {
    id: "ae-5",
    source: "a-resend",
    target: "a-browser",
    type: "packet",
    sourceHandle: "left-out",
    targetHandle: "bottom-in",
    label: "verification link",
    data: { color: "#14b8a6" },
  },
  {
    id: "ae-6",
    source: "a-browser",
    target: "a-better-auth",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "verify callback",
    data: { color: "#3b82f6" },
  },
  {
    id: "ae-7",
    source: "a-better-auth",
    target: "a-cookie",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "Set-Cookie",
    data: { color: "#22c55e" },
  },
  {
    id: "ae-8",
    source: "a-browser",
    target: "a-google",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "top-in",
    label: "OAuth start",
    data: { color: "#3b82f6" },
  },
  {
    id: "ae-9",
    source: "a-google",
    target: "a-better-auth",
    type: "packet",
    sourceHandle: "left-out",
    targetHandle: "right-in",
    label: "OAuth callback",
    data: { color: "#3b82f6" },
  },
];

export const AUTH_STEPS = [
  {
    id: "auth-s1",
    title: "Credential auth",
    description:
      "Email/password flows are handled by Better Auth and persisted via the Drizzle PostgreSQL adapter.",
    edges: ["ae-1", "ae-2", "ae-3"],
  },
  {
    id: "auth-s2",
    title: "Email verification",
    description:
      "On sign-up, Better Auth sends verification email through Resend and validates callback completion.",
    edges: ["ae-4", "ae-5", "ae-6", "ae-2"],
  },
  {
    id: "auth-s3",
    title: "Session issuance",
    description:
      "After successful auth/verification, Next Cookies plugin stores the session cookie in browser.",
    edges: ["ae-7", "ae-2", "ae-3"],
  },
  {
    id: "auth-s4",
    title: "Google OAuth",
    description:
      "Optional social auth uses Google provider then returns to Better Auth callback handlers.",
    edges: ["ae-8", "ae-9", "ae-7", "ae-2"],
  },
];
