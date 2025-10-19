import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Loading from "../loading";

describe("Loading Component", () => {
  describe("Rendering", () => {
    it("should render the loading component", () => {
      render(<Loading />);
      expect(screen.getByText("Loading match details...")).toBeInTheDocument();
    });

    it("should render the main heading", () => {
      render(<Loading />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Loading match details...");
    });

    it("should render the subtitle message", () => {
      render(<Loading />);
      expect(
        screen.getByText("Please wait while we fetch all match information.")
      ).toBeInTheDocument();
    });

    it("should render the loading spinner/circle", () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector(".bg-orange-500");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Styling and Classes", () => {
    it("should have correct container styling", () => {
      const { container } = render(<Loading />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv).toHaveClass("flex");
      expect(mainDiv).toHaveClass("items-center");
      expect(mainDiv).toHaveClass("justify-center");
      expect(mainDiv).toHaveClass("min-h-screen");
      expect(mainDiv).toHaveClass("bg-black");
    });

    it("should have animate-bounce class on content wrapper", () => {
      const { container } = render(<Loading />);
      const animatedDiv = container.querySelector(".animate-bounce");
      
      expect(animatedDiv).toBeInTheDocument();
      expect(animatedDiv).toHaveClass("text-center");
    });

    it("should have correct heading styling", () => {
      render(<Loading />);
      const heading = screen.getByRole("heading", { level: 1 });
      
      expect(heading).toHaveClass("text-2xl");
      expect(heading).toHaveClass("font-bold");
      expect(heading).toHaveClass("text-orange-500");
      expect(heading).toHaveClass("mb-2");
    });

    it("should have correct subtitle styling", () => {
      render(<Loading />);
      const subtitle = screen.getByText(
        "Please wait while we fetch all match information."
      );
      
      expect(subtitle).toHaveClass("text-gray-300");
    });

    it("should have correct spinner styling", () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector(".bg-orange-500");
      
      expect(spinner).toHaveClass("mx-auto");
      expect(spinner).toHaveClass("mb-6");
      expect(spinner).toHaveClass("w-12");
      expect(spinner).toHaveClass("h-12");
      expect(spinner).toHaveClass("rounded-full");
      expect(spinner).toHaveClass("bg-orange-500");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<Loading />);
      const headings = screen.getAllByRole("heading");
      
      expect(headings).toHaveLength(1);
      expect(headings[0].tagName).toBe("H1");
    });

    it("should render text content that is accessible", () => {
      render(<Loading />);
      
      // Main loading message should be accessible
      expect(screen.getByText("Loading match details...")).toBeVisible();
      
      // Subtitle should be accessible
      expect(
        screen.getByText("Please wait while we fetch all match information.")
      ).toBeVisible();
    });

    it("should have semantic HTML structure", () => {
      const { container } = render(<Loading />);
      const paragraph = container.querySelector("p");
      
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveTextContent(
        "Please wait while we fetch all match information."
      );
    });
  });

  describe("Component Structure", () => {
    it("should render three main child elements", () => {
      const { container } = render(<Loading />);
      const centerDiv = container.querySelector(".text-center");
      
      expect(centerDiv?.children).toHaveLength(3);
    });

    it("should render spinner before heading", () => {
      const { container } = render(<Loading />);
      const centerDiv = container.querySelector(".text-center");
      const firstChild = centerDiv?.firstChild as HTMLElement;
      
      expect(firstChild).toHaveClass("bg-orange-500");
    });

    it("should render heading before subtitle", () => {
      const { container } = render(<Loading />);
      const centerDiv = container.querySelector(".text-center");
      const children = Array.from(centerDiv?.children || []);
      
      const headingIndex = children.findIndex(
        (child) => child.tagName === "H1"
      );
      const paragraphIndex = children.findIndex(
        (child) => child.tagName === "P"
      );
      
      expect(headingIndex).toBeLessThan(paragraphIndex);
    });
  });

  describe("Visual Elements", () => {
    it("should render a circular spinner", () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector(".rounded-full");
      
      expect(spinner).toBeInTheDocument();
    });

    it("should have orange color scheme", () => {
      const { container } = render(<Loading />);
      
      // Check for orange-500 class usage
      const orangeElements = container.querySelectorAll(".text-orange-500, .bg-orange-500");
      expect(orangeElements.length).toBeGreaterThanOrEqual(2);
    });

    it("should have black background", () => {
      const { container } = render(<Loading />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv).toHaveClass("bg-black");
    });

    it("should center content vertically and horizontally", () => {
      const { container } = render(<Loading />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv).toHaveClass("flex");
      expect(mainDiv).toHaveClass("items-center");
      expect(mainDiv).toHaveClass("justify-center");
    });

    it("should take full screen height", () => {
      const { container } = render(<Loading />);
      const mainDiv = container.firstChild as HTMLElement;
      
      expect(mainDiv).toHaveClass("min-h-screen");
    });
  });

  describe("Animation", () => {
    it("should have bounce animation applied", () => {
      const { container } = render(<Loading />);
      const animatedElement = container.querySelector(".animate-bounce");
      
      expect(animatedElement).toBeInTheDocument();
    });

    it("should apply animation to the content wrapper", () => {
      const { container } = render(<Loading />);
      const centerDiv = container.querySelector(".text-center");
      
      expect(centerDiv).toHaveClass("animate-bounce");
    });
  });

  describe("Text Content", () => {
    it("should display correct loading message", () => {
      render(<Loading />);
      expect(screen.getByText(/Loading match details/i)).toBeInTheDocument();
    });

    it("should display correct waiting instruction", () => {
      render(<Loading />);
      expect(
        screen.getByText(/Please wait while we fetch all match information/i)
      ).toBeInTheDocument();
    });

    it("should use proper punctuation", () => {
      render(<Loading />);
      expect(screen.getByText("Loading match details...")).toBeInTheDocument();
      expect(
        screen.getByText("Please wait while we fetch all match information.")
      ).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive text sizing", () => {
      render(<Loading />);
      const heading = screen.getByRole("heading", { level: 1 });
      
      expect(heading).toHaveClass("text-2xl");
    });

    it("should have proper spacing classes", () => {
      render(<Loading />);
      const heading = screen.getByRole("heading", { level: 1 });
      
      expect(heading).toHaveClass("mb-2");
    });

    it("should have centered spinner with margin", () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector(".bg-orange-500");
      
      expect(spinner).toHaveClass("mx-auto");
      expect(spinner).toHaveClass("mb-6");
    });
  });

  describe("Color Consistency", () => {
    it("should use consistent orange color for branding", () => {
      const { container } = render(<Loading />);
      
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass("text-orange-500");
      
      const spinner = container.querySelector(".bg-orange-500");
      expect(spinner).toHaveClass("bg-orange-500");
    });

    it("should use gray for secondary text", () => {
      render(<Loading />);
      const subtitle = screen.getByText(
        "Please wait while we fetch all match information."
      );
      
      expect(subtitle).toHaveClass("text-gray-300");
    });
  });

  describe("Edge Cases", () => {
    it("should render without errors", () => {
      expect(() => render(<Loading />)).not.toThrow();
    });

    it("should render consistently on multiple renders", () => {
      const { rerender } = render(<Loading />);
      expect(screen.getByText("Loading match details...")).toBeInTheDocument();
      
      rerender(<Loading />);
      expect(screen.getByText("Loading match details...")).toBeInTheDocument();
    });

    it("should not have any props requirements", () => {
      // Component should render without any props
      expect(() => render(<Loading />)).not.toThrow();
    });
  });

  describe("Component Isolation", () => {
    it("should not depend on external context", () => {
      // Component should render independently without context providers
      expect(() => render(<Loading />)).not.toThrow();
    });

    it("should be a pure presentational component", () => {
      const { container: container1 } = render(<Loading />);
      const { container: container2 } = render(<Loading />);
      
      // Both renders should produce identical output
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });
});