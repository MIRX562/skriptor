import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LogoutButton from "../logout-button";

describe("LogoutButton Component", () => {
  it("renders the logout button correctly", () => {
    render(<LogoutButton />);
    expect(screen.getByText("LogoutButton")).toBeInTheDocument();
  });
});
