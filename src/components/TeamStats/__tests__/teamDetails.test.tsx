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

    it("should display Active Players label", () => {
      render(<TeamDetails {...defaultProps} />);
      expect(screen.getByText("Active Players")).toBeInTheDocument();
    });

    it("should render team logo placeholder when no logo provided", () => {
      render(<TeamDetails {...defaultProps} />);
      const logoPlaceholder = screen.getByText("M");
      expect(logoPlaceholder).toBeInTheDocument();
      expect(logoPlaceholder).toHaveClass("text-4xl", "font-bold", "text-orange-500");
    });

    it("should render team initial as first letter of team name", () => {
      render(<TeamDetails teamName="Arsenal" numPlayers={25} />);
      expect(screen.getByText("A")).toBeInTheDocument();
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

    it("should handle team logo prop", () => {
      render(<TeamDetails {...defaultProps} teamLogo="/test-logo.png" />);
      const logoImage = screen.getByAltText("Manchester United");
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute("src");
    });

    it("should not render logo placeholder when logo is provided", () => {
      render(<TeamDetails {...defaultProps} teamLogo="/test-logo.png" />);
      expect(screen.queryByText("M")).not.toBeInTheDocument();
    });
  });

  describe("Hover Interactions", () => {
    it("should handle mouse enter and leave on main container", () => {
      render(<TeamDetails {...defaultProps} />);
      const container = screen.getByText("Manchester United").closest("div");

      expect(container).toBeInTheDocument();
      
      fireEvent.mouseEnter(container!);
      expect(container).toBeInTheDocument();
      
      fireEvent.mouseLeave(container!);
      expect(container).toBeInTheDocument();
    });

    it("should handle mouse enter and leave on player count section", () => {
      render(<TeamDetails {...defaultProps} />);
      const playersSection = screen.getByText("Active Players").closest("div");

      expect(playersSection).toBeInTheDocument();
      
      fireEvent.mouseEnter(playersSection!);
      expect(playersSection).toBeInTheDocument();
      
      fireEvent.mouseLeave(playersSection!);
      expect(playersSection).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply container styles", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const mainContainer = container.querySelector('.bg-white\\/80');
      
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('backdrop-blur-md', 'rounded-2xl', 'border', 'shadow-lg');
    });

    it("should render pulsing animation divs", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const animatedDivs = container.querySelectorAll('.animate-ping');
      
      expect(animatedDivs.length).toBeGreaterThanOrEqual(2);
    });

    it("should apply proper gradient to logo container", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const logoContainer = container.querySelector('.bg-gradient-to-br');
      
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).toHaveClass('from-orange-500', 'to-orange-600');
    });

    it("should have responsive flex layout", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const flexContainer = container.querySelector('.flex-col');
      
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('md:flex-row');
    });
  });

  describe("Accessibility", () => {
    it("should render semantic HTML structure", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const heading = container.querySelector("h1");
      
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Manchester United");
    });

    it("should have proper heading hierarchy", () => {
      render(<TeamDetails {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      
      expect(heading).toHaveTextContent("Manchester United");
    });

    it("should have alt text for team logo when provided", () => {
      render(<TeamDetails {...defaultProps} teamLogo="/test-logo.png" />);
      const logoImage = screen.getByAltText("Manchester United");
      
      expect(logoImage).toBeInTheDocument();
    });

    it("should render Users icon for accessibility", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      const usersIcon = container.querySelector('svg');
      
      expect(usersIcon).toBeInTheDocument();
      expect(usersIcon).toHaveClass('lucide-users');
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

    it("should handle single character team name", () => {
      render(<TeamDetails teamName="A" numPlayers={25} />);
      // "A" appears twice - in heading and logo placeholder
      const elements = screen.getAllByText("A");
      expect(elements.length).toBe(2);
      expect(elements[0]).toBeInTheDocument();
    });

    it("should handle team name with only spaces", () => {
      const { container } = render(<TeamDetails teamName="   " numPlayers={25} />);
      // Check that the heading exists (even if empty/whitespace)
      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      // Check that logo placeholder exists (even if empty/whitespace)
      const logoPlaceholder = container.querySelector('.text-4xl.font-bold.text-orange-500');
      expect(logoPlaceholder).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render logo container with pulsing effects", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const logoSection = container.querySelector('.relative.flex-shrink-0');
      expect(logoSection).toBeInTheDocument();
      
      const pulsingDivs = logoSection?.querySelectorAll('.animate-ping');
      expect(pulsingDivs?.length).toBe(2);
    });

    it("should render team info section", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const infoSection = container.querySelector('.flex-1');
      expect(infoSection).toBeInTheDocument();
      expect(infoSection).toHaveClass('text-center', 'md:text-left');
    });

    it("should have proper z-index stacking for logo", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const logoContainer = container.querySelector('.z-10');
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).toHaveClass('w-24', 'h-24', 'rounded-full');
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

    it("should work without optional teamLogo prop", () => {
      expect(() => {
        render(<TeamDetails teamName="Team" numPlayers={25} />);
      }).not.toThrow();
    });

    it("should work with optional teamLogo prop", () => {
      expect(() => {
        render(<TeamDetails teamName="Team" numPlayers={25} teamLogo="/logo.png" />);
      }).not.toThrow();
    });
  });

  describe("Visual Elements", () => {
    it("should render circular logo container", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const logoCircle = container.querySelector('.rounded-full.bg-gradient-to-br');
      expect(logoCircle).toBeInTheDocument();
      expect(logoCircle).toHaveClass('w-24', 'h-24');
    });

    it("should display orange theme colors", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const orangeElements = container.querySelectorAll('[class*="orange"]');
      expect(orangeElements.length).toBeGreaterThan(0);
    });

    it("should have shadow effects", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const shadowElement = container.querySelector('.shadow-xl');
      expect(shadowElement).toBeInTheDocument();
    });

    it("should have backdrop blur effect", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const blurElement = container.querySelector('.backdrop-blur-md');
      expect(blurElement).toBeInTheDocument();
    });
  });

  describe("Animation Properties", () => {
    it("should have custom animation durations on pulsing effects", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const animatedDivs = container.querySelectorAll('.animate-ping');
      const firstDiv = animatedDivs[0] as HTMLElement;
      const secondDiv = animatedDivs[1] as HTMLElement;
      
      expect(firstDiv.style.animationDuration).toBe('3s');
      expect(secondDiv.style.animationDuration).toBe('4s');
      expect(secondDiv.style.animationDelay).toBe('0.5s');
    });
  });

  describe("Layout Responsiveness", () => {
    it("should have responsive text alignment", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const infoSection = container.querySelector('.text-center.md\\:text-left');
      expect(infoSection).toBeInTheDocument();
    });

    it("should have responsive flex direction", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const flexContainer = container.querySelector('.flex-col.md\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });

    it("should have responsive gap spacing", () => {
      const { container } = render(<TeamDetails {...defaultProps} />);
      
      const containerWithGap = container.querySelector('.gap-8');
      expect(containerWithGap).toBeInTheDocument();
    });
  });
});