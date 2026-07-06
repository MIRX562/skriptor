import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock environment variables
process.env.DATABASE_URL = "postgresql://localhost:5432/test-db";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.WORKER_SHARED_SECRET = "test-secret";
process.env.S3_ENDPOINT = "https://s3.example.com";
process.env.S3_BUCKET = "test-bucket";
process.env.S3_REGION = "us-east-1";
process.env.S3_ACCESS_KEY = "test-key";
process.env.S3_SECRET_KEY = "test-secret";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

// Mock better-auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "test-user-id", email: "test@example.com" },
      }),
    },
  },
}));

// Mock ioredis
vi.mock("ioredis", () => {
  const MockRedis = vi.fn().mockImplementation(function() {
    return {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      publish: vi.fn(),
      duplicate: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      quit: vi.fn(),
    };
  });
  return {
    default: MockRedis,
    Redis: MockRedis,
  };
});

// Mock bullmq
vi.mock("bullmq", () => {
  const MockQueue = vi.fn().mockImplementation(function() {
    return {
      add: vi.fn().mockResolvedValue({ id: "test-job-id" }),
    };
  });
  return {
    Queue: MockQueue,
  };
});

// Mock @aws-sdk/client-s3
vi.mock("@aws-sdk/client-s3", () => {
  const MockS3Client = vi.fn().mockImplementation(function() {
    return {
      send: vi.fn().mockResolvedValue({}),
    };
  });
  const MockPutObject = vi.fn().mockImplementation(function(args) {
    return args;
  });
  const MockGetObject = vi.fn().mockImplementation(function(args) {
    return args;
  });
  const MockDeleteObject = vi.fn().mockImplementation(function(args) {
    return args;
  });

  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockPutObject,
    GetObjectCommand: MockGetObject,
    DeleteObjectCommand: MockDeleteObject,
  };
});

// Mock @aws-sdk/s3-request-presigner
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/test-bucket/presigned-url"),
}));

// Mock fetch globally
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
  text: async () => "mock-text",
});

// Mock localStorage globally
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  });
}

// Mock next/server
vi.mock("next/server", () => {
  class MockNextRequest extends Request {}
  class MockNextResponse extends Response {
    static json(body: any, init?: ResponseInit) {
      const res = new Response(JSON.stringify(body), init);
      Object.defineProperty(res, "json", {
        value: async () => body,
        configurable: true,
      });
      return res;
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
    connection: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock next/image
vi.mock("next/image", () => {
  return {
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return React.createElement("img", { ...props });
    },
  };
});

// Mock SoftAurora (WebGL component)
vi.mock("@/components/SoftAurora", () => {
  return {
    default: () => React.createElement("div", { "data-testid": "soft-aurora" }),
  };
});

// Mock better-auth client
vi.mock("@/lib/auth-client", () => {
  return {
    authClient: {
      useSession: vi.fn().mockReturnValue({ data: null, isPending: false }),
      signIn: {
        email: vi.fn().mockResolvedValue({}),
      },
      signUp: {
        email: vi.fn().mockResolvedValue({}),
      },
      signOut: vi.fn().mockResolvedValue({}),
    },
  };
});




