import * as React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { Toaster } from "../sonner"

// Mock dependencies
jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}))

jest.mock("sonner", () => ({
  Toaster: ({ theme, className, icons, style, expand, richColors, ...props }: any) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      className={className}
      style={style}
      {...props}
    >
      {icons && (
        <div data-testid="icons">
          {icons.success && <div data-testid="icon-success">{icons.success}</div>}
          {icons.info && <div data-testid="icon-info">{icons.info}</div>}
          {icons.warning && <div data-testid="icon-warning">{icons.warning}</div>}
          {icons.error && <div data-testid="icon-error">{icons.error}</div>}
          {icons.loading && <div data-testid="icon-loading">{icons.loading}</div>}
        </div>
      )}
    </div>
  ),
}))

jest.mock("lucide-react", () => ({
  CircleCheckIcon: ({ className }: any) => (
    <svg data-testid="circle-check-icon" className={className} />
  ),
  InfoIcon: ({ className }: any) => (
    <svg data-testid="info-icon" className={className} />
  ),
  TriangleAlertIcon: ({ className }: any) => (
    <svg data-testid="triangle-alert-icon" className={className} />
  ),
  OctagonXIcon: ({ className }: any) => (
    <svg data-testid="octagon-x-icon" className={className} />
  ),
  Loader2Icon: ({ className }: any) => (
    <svg data-testid="loader2-icon" className={className} />
  ),
}))

const { useTheme } = require("next-themes")

describe("Toaster", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders with default theme", () => {
    useTheme.mockReturnValue({ theme: "system" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute("data-theme", "system")
  })

  it("applies correct className", () => {
    useTheme.mockReturnValue({ theme: "system" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveClass("toaster group")
  })

  it("renders with light theme", () => {
    useTheme.mockReturnValue({ theme: "light" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveAttribute("data-theme", "light")
  })

  it("renders with dark theme", () => {
    useTheme.mockReturnValue({ theme: "dark" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveAttribute("data-theme", "dark")
  })

  it("defaults to system theme when theme is undefined", () => {
    useTheme.mockReturnValue({})
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveAttribute("data-theme", "system")
  })

  it("applies custom CSS properties as style", () => {
    useTheme.mockReturnValue({ theme: "system" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveStyle({
      "--normal-bg": "var(--popover)",
      "--normal-text": "var(--popover-foreground)",
      "--normal-border": "var(--border)",
      "--border-radius": "var(--radius)",
    })
  })

  it("passes through additional props", () => {
    useTheme.mockReturnValue({ theme: "system" })
    
    render(<Toaster position="top-center" duration={5000} />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveAttribute("position", "top-center")
    expect(toaster).toHaveAttribute("duration", "5000")
  })
})

describe("Toaster Icons", () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: "system" })
  })

  it("renders success icon with correct props", () => {
    render(<Toaster />)
    
    const successIcon = screen.getByTestId("circle-check-icon")
    expect(successIcon).toBeInTheDocument()
    expect(successIcon).toHaveClass("size-4")
  })

  it("renders info icon with correct props", () => {
    render(<Toaster />)
    
    const infoIcon = screen.getByTestId("info-icon")
    expect(infoIcon).toBeInTheDocument()
    expect(infoIcon).toHaveClass("size-4")
  })

  it("renders warning icon with correct props", () => {
    render(<Toaster />)
    
    const warningIcon = screen.getByTestId("triangle-alert-icon")
    expect(warningIcon).toBeInTheDocument()
    expect(warningIcon).toHaveClass("size-4")
  })

  it("renders error icon with correct props", () => {
    render(<Toaster />)
    
    const errorIcon = screen.getByTestId("octagon-x-icon")
    expect(errorIcon).toBeInTheDocument()
    expect(errorIcon).toHaveClass("size-4")
  })

  it("renders loading icon with correct props and animation", () => {
    render(<Toaster />)
    
    const loadingIcon = screen.getByTestId("loader2-icon")
    expect(loadingIcon).toBeInTheDocument()
    expect(loadingIcon).toHaveClass("size-4")
    expect(loadingIcon).toHaveClass("animate-spin")
  })

  it("provides all icon types", () => {
    render(<Toaster />)
    
    expect(screen.getByTestId("icon-success")).toBeInTheDocument()
    expect(screen.getByTestId("icon-info")).toBeInTheDocument()
    expect(screen.getByTestId("icon-warning")).toBeInTheDocument()
    expect(screen.getByTestId("icon-error")).toBeInTheDocument()
    expect(screen.getByTestId("icon-loading")).toBeInTheDocument()
  })
})

describe("Toaster Theme Integration", () => {
  it("updates theme when theme changes", () => {
    useTheme.mockReturnValue({ theme: "light" })
    
    const { rerender } = render(<Toaster />)
    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute("data-theme", "light")
    
    useTheme.mockReturnValue({ theme: "dark" })
    rerender(<Toaster />)
    
    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute("data-theme", "dark")
  })

  it("handles theme changes from system to light", () => {
    useTheme.mockReturnValue({ theme: "system" })
    
    const { rerender } = render(<Toaster />)
    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute("data-theme", "system")
    
    useTheme.mockReturnValue({ theme: "light" })
    rerender(<Toaster />)
    
    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute("data-theme", "light")
  })

  it("handles theme changes from dark to system", () => {
    useTheme.mockReturnValue({ theme: "dark" })
    
    const { rerender } = render(<Toaster />)
    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute("data-theme", "dark")
    
    useTheme.mockReturnValue({ theme: "system" })
    rerender(<Toaster />)
    
    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute("data-theme", "system")
  })
})

describe("Toaster Edge Cases", () => {
  it("handles missing theme gracefully", () => {
    useTheme.mockReturnValue({ theme: "" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    // Empty string is still passed through, the default only applies when destructuring undefined
    expect(toaster).toHaveAttribute("data-theme", "")
  })

  it("handles undefined useTheme return", () => {
    useTheme.mockReturnValue({ theme: undefined })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveAttribute("data-theme", "system")
  })

  it("preserves custom props alongside default configuration", () => {
    useTheme.mockReturnValue({ theme: "dark" })
    
    render(
      <Toaster 
        position="bottom-right"
      />
    )
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveAttribute("data-theme", "dark")
    expect(toaster).toHaveAttribute("position", "bottom-right")
    expect(toaster).toBeInTheDocument()
  })

  it("applies className correctly", () => {
    useTheme.mockReturnValue({ theme: "system" })
    
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster).toHaveClass("toaster group")
  })
})

describe("Toaster CSS Custom Properties", () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: "system" })
  })

  it("sets --normal-bg custom property", () => {
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster.style.getPropertyValue("--normal-bg")).toBe("var(--popover)")
  })

  it("sets --normal-text custom property", () => {
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster.style.getPropertyValue("--normal-text")).toBe("var(--popover-foreground)")
  })

  it("sets --normal-border custom property", () => {
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster.style.getPropertyValue("--normal-border")).toBe("var(--border)")
  })

  it("sets --border-radius custom property", () => {
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    
    expect(toaster.style.getPropertyValue("--border-radius")).toBe("var(--radius)")
  })

  it("applies all CSS custom properties together", () => {
    render(<Toaster />)
    const toaster = screen.getByTestId("sonner-toaster")
    const style = toaster.style
    
    expect(style.getPropertyValue("--normal-bg")).toBeTruthy()
    expect(style.getPropertyValue("--normal-text")).toBeTruthy()
    expect(style.getPropertyValue("--normal-border")).toBeTruthy()
    expect(style.getPropertyValue("--border-radius")).toBeTruthy()
  })
})