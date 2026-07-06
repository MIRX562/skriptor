import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "../logo";
import GradientText from "../GradientText";
import ShinyText from "../ShinyText";

describe("Shared Components", () => {
  it("renders the Logo component containing an image", () => {
    render(<Logo />);
    const logoImg = screen.getByAltText("logo");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "/logo.png");
  });

  it("renders GradientText with colors and children text", () => {
    render(
      <GradientText colors={["#000", "#fff"]} animationSpeed={2}>
        Hello Gradient
      </GradientText>
    );
    expect(screen.getByText("Hello Gradient")).toBeInTheDocument();
  });

  it("renders ShinyText correctly", () => {
    render(<ShinyText text="Shiny Work" disabled={false} speed={3} />);
    expect(screen.getByText("Shiny Work")).toBeInTheDocument();
  });
});
