import * as React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { Spinner } from "../spinner"

// Mock dependencies
jest.mock("../../../lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}))

jest.mock("lucide-react", () => ({
  Loader2Icon: ({ className, role, ...props }: any) => (
    <svg
      data-testid="loader-icon"
      className={className}
      role={role}
      {...props}
    />
  ),
}))

describe("Spinner", () => {
  it("renders the Loader2Icon component", () => {
    render(<Spinner />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toBeInTheDocument()
  })

  it("applies default className with size and animation", () => {
    render(<Spinner />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("size-4")
    expect(spinner).toHaveClass("animate-spin")
  })

  it("applies custom className alongside defaults", () => {
    render(<Spinner className="text-primary" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("size-4")
    expect(spinner).toHaveClass("animate-spin")
    expect(spinner).toHaveClass("text-primary")
  })

  it("has status role for accessibility", () => {
    render(<Spinner />)
    
    const spinner = screen.getByRole("status")
    expect(spinner).toBeInTheDocument()
  })

  it("has aria-label for screen readers", () => {
    render(<Spinner />)
    
    const spinner = screen.getByLabelText("Loading")
    expect(spinner).toBeInTheDocument()
  })

  it("passes through additional SVG props", () => {
    render(<Spinner data-testid="custom-spinner" width={24} height={24} />)
    
    const spinner = screen.getByTestId("custom-spinner")
    expect(spinner).toHaveAttribute("width", "24")
    expect(spinner).toHaveAttribute("height", "24")
  })

  it("allows custom aria-label override", () => {
    render(<Spinner aria-label="Processing" />)
    
    const spinner = screen.getByLabelText("Processing")
    expect(spinner).toBeInTheDocument()
  })

  it("allows custom role override", () => {
    render(<Spinner role="img" />)
    
    const spinner = screen.getByRole("img")
    expect(spinner).toBeInTheDocument()
  })
})

describe("Spinner Styling", () => {
  it("can override size with custom className", () => {
    render(<Spinner className="size-8" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("size-8")
  })

  it("can add color classes", () => {
    render(<Spinner className="text-blue-500" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("text-blue-500")
  })

  it("can add opacity classes", () => {
    render(<Spinner className="opacity-50" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("opacity-50")
  })

  it("handles empty className", () => {
    render(<Spinner className="" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("size-4")
    expect(spinner).toHaveClass("animate-spin")
  })

  it("handles null className", () => {
    render(<Spinner className={null as any} />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("size-4")
    expect(spinner).toHaveClass("animate-spin")
  })

  it("handles undefined className", () => {
    render(<Spinner className={undefined} />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("size-4")
    expect(spinner).toHaveClass("animate-spin")
  })
})

describe("Spinner Accessibility", () => {
  it("is accessible to screen readers with status role", () => {
    render(<Spinner />)
    
    const spinner = screen.getByRole("status")
    expect(spinner).toHaveAttribute("aria-label", "Loading")
  })

  it("can have custom accessible name", () => {
    render(<Spinner aria-label="Saving changes" />)
    
    expect(screen.getByLabelText("Saving changes")).toBeInTheDocument()
  })

  it("maintains accessibility attributes with custom props", () => {
    render(<Spinner className="size-8" aria-label="Custom loading" />)
    
    const spinner = screen.getByRole("status")
    expect(spinner).toHaveAttribute("aria-label", "Custom loading")
  })
})

describe("Spinner Edge Cases", () => {
  it("renders without any props", () => {
    render(<Spinner />)
    
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument()
  })

  it("handles multiple className strings", () => {
    render(<Spinner className="text-red-500 size-6 opacity-75" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("text-red-500")
    expect(spinner).toHaveClass("size-6")
    expect(spinner).toHaveClass("opacity-75")
  })

  it("preserves animation class even with custom classes", () => {
    render(<Spinner className="size-12 text-green-500" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveClass("animate-spin")
  })

  it("can be used with data attributes", () => {
    render(<Spinner data-loading="true" data-component="spinner" />)
    
    const spinner = screen.getByTestId("loader-icon")
    expect(spinner).toHaveAttribute("data-loading", "true")
    expect(spinner).toHaveAttribute("data-component", "spinner")
  })
})

describe("Spinner Integration", () => {
  it("renders in a button context", () => {
    render(
      <button disabled>
        <Spinner className="mr-2" />
        Loading...
      </button>
    )
    
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders in a loading state container", () => {
    render(
      <div data-testid="loading-container">
        <Spinner />
        <p>Please wait...</p>
      </div>
    )
    
    expect(screen.getByTestId("loading-container")).toContainElement(
      screen.getByRole("status")
    )
    expect(screen.getByText("Please wait...")).toBeInTheDocument()
  })

  it("renders multiple spinners with different sizes", () => {
    render(
      <div>
        <Spinner className="size-4" data-testid="small-spinner" />
        <Spinner className="size-8" data-testid="medium-spinner" />
        <Spinner className="size-12" data-testid="large-spinner" />
      </div>
    )
    
    expect(screen.getByTestId("small-spinner")).toHaveClass("size-4")
    expect(screen.getByTestId("medium-spinner")).toHaveClass("size-8")
    expect(screen.getByTestId("large-spinner")).toHaveClass("size-12")
  })

  it("works with conditional rendering", () => {
    const { rerender } = render(
      <div>
        {true && <Spinner data-testid="conditional-spinner" />}
      </div>
    )
    
    expect(screen.getByTestId("conditional-spinner")).toBeInTheDocument()
    
    rerender(
      <div>
        {false && <Spinner data-testid="conditional-spinner" />}
      </div>
    )
    
    expect(screen.queryByTestId("conditional-spinner")).not.toBeInTheDocument()
  })
})