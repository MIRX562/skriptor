import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomNode } from "../custom-node";
import { Server } from "lucide-react";

// Mock @xyflow/react elements
vi.mock("@xyflow/react", () => ({
  Handle: ({ id, position }: any) => <div data-testid={`handle-${id}-${position}`} />,
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
}));

describe("CustomNode Component", () => {
  it("renders group type nodes correctly", () => {
    const mockData = {
      label: "Worker Group",
      isActive: true,
    };

    render(<CustomNode data={mockData} type="group" />);
    expect(screen.getByText("Worker Group")).toBeInTheDocument();
  });

  it("renders server and service nodes with icons and labels", () => {
    const mockData = {
      label: "Main Server",
      description: "API Gateway",
      icon: Server,
      type: "server" as const,
      isActive: true,
    };

    render(<CustomNode data={mockData} type="server" />);
    
    expect(screen.getByText("Main Server")).toBeInTheDocument();
    expect(screen.getByText("API Gateway")).toBeInTheDocument();
    
    // Verify handles are present
    expect(screen.getByTestId("handle-top-top")).toBeInTheDocument();
    expect(screen.getByTestId("handle-bottom-out-bottom")).toBeInTheDocument();
  });
});
