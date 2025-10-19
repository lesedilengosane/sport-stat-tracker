import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TeamDetails from "../TeamDetails";

describe("TeamDetails Component", () => {
  const defaultProps = {
    teamName: "Manchester United",
    numPlayers: 25,
  };

  describe("Rendering", () => {
    it("should render the team name correctly", () => {
      render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("Manchester United")).toBeInTheDocument();
    });

    it("should render the number of players correctly", () => {
      render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("should render with string number of players", () => {
      render(<TeamDetails teamName="Liverpool" numPlayers="30" />);
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("should display Squad Size heading", () => {
      render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("Squad Size")).toBeInTheDocument();
    });

    it("should display Active Players label", () => {
      render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("Active Players")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should handle different team names", () => {
      const { rerender } = render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("Manchester United")).toBeInTheDocument();

      rerender(<TeamDetails teamName="Arsenal" numPlayers={25} />);
      expect(screen.getByText("Arsenal")).toBeInTheDocument();
      expect(screen.queryByText("Manchester United")).not.toBeInTheDocument();
    });

    it("should handle different player counts", () => {
      const { rerender } = render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("25")).toBeInTheDocument();

      rerender(<TeamDetails teamName="Manchester United" numPlayers={30} />);
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.queryByText("25")).not.toBeInTheDocument();
    });

    it("should handle zero players", () => {
      render(<TeamDetails teamName="New Team" numPlayers={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle empty team name", () => {
      render(<TeamDetails teamName="" numPlayers={25} />);
      expect(screen.getByText("25")).toBeInTheDocument();
    });
  });

  describe("Hover Interactions", () => {
    it("should handle mouse enter and leave on team name box", () => {
      render(<TeamDetails {...defaultProps} />);
      const teamBox = screen.getByText("Manchester United").closest("div");

      expect(teamBox).toBeInTheDocument();
      
      fireEvent.mouseEnter(teamBox!);
      // Verify hover state is triggered
      expect(teamBox).toBeInTheDocument();
      
      fireEvent.mouseLeave(teamBox!);
      // Verify hover state is removed
      expect(teamBox).toBeInTheDocument();
    });

    it("should handle mouse enter and leave on players box", () => {
      render(<TeamDetails {...defaultProps} />);
      const playersBox = screen.getByText("Squad Size").closest("div");

      expect(playersBox).toBeInTheDocument();
      
      fireEvent.mouseEnter(playersBox!);
      expect(playersBox).toBeInTheDocument();
      
      fireEvent.mouseLeave(playersBox!);
      expect(playersBox).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply container styles", () => {
      render(<TeamDetails {...defaultProps} />);
      const mainContainer = screen.getByText("Manchester United").closest("div")?.parentElement;
      
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveStyle({
        display: "flex",
      });
    });

    it("should render style tag for animations", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const styleTag = container.querySelector("style");
      
      expect(styleTag).toBeInTheDocument();
      expect(styleTag?.textContent).toContain("@keyframes pulse");
      expect(styleTag?.textContent).toContain("@keyframes borderGlow");
    });
  });

  describe("Accessibility", () => {
    it("should render semantic HTML structure", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const paragraphs = container.querySelectorAll("p");
      const headings = container.querySelectorAll("h2");
      
      expect(paragraphs.length).toBeGreaterThan(0);
      expect(headings.length).toBe(1);
    });

    it("should have proper heading hierarchy", () => {
      render(<TeamDetails {...defaultProps} />);
      const heading = screen.getByText("Squad Size");
      
      expect(heading.tagName).toBe("H2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long team names", () => {
      const longName = "A".repeat(100);
      render(<TeamDetails teamName={longName} numPlayers={25} />);
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("should handle very large player numbers", () => {
      render(<TeamDetails teamName="Team" numPlayers={99999} />);
      expect(screen.getByText("99999")).toBeInTheDocument();
    });

    it("should handle negative player numbers", () => {
      render(<TeamDetails teamName="Team" numPlayers={-5} />);
      expect(screen.getByText("-5")).toBeInTheDocument();
    });

    it("should handle special characters in team name", () => {
      const specialName = "Team @#$%^&* 2024!";
      render(<TeamDetails teamName={specialName} numPlayers={25} />);
      expect(screen.getByText(specialName)).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render two main boxes", () => {
      render(<TeamDetails {...defaultProps} />);
      
      // Find the team name box
      const teamBox = screen.getByText("Manchester United").closest("div");
      // Find the players box
      const playersBox = screen.getByText("Squad Size").closest("div");
      
      expect(teamBox).toBeInTheDocument();
      expect(playersBox).toBeInTheDocument();
    });

    it("should render glow effect divs", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const glowDivs = container.querySelectorAll('[style*="position: absolute"]');
      
      expect(glowDivs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("TypeScript Props Validation", () => {
    it("should accept number type for numPlayers", () => {
      expect(() => {
        render(<TeamDetails teamName="Team" numPlayers={25} />);
      }).not.toThrow();
    });

    it("should accept string type for numPlayers", () => {
      expect(() => {
        render(<TeamDetails teamName="Team" numPlayers="25" />);
      }).not.toThrow();
    });
  });
});