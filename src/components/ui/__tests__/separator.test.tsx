import * as React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { Separator } from "../separator"

// Mock dependencies
jest.mock("../../../lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}))

jest.mock("@radix-ui/react-separator", () => ({
  Root: React.forwardRef(({ className, orientation, decorative, ...props }: any, ref: any) => (
    <div
      ref={ref}
      role="separator"
      data-orientation={orientation}
      aria-orientation={orientation}
      className={className}
      {...(decorative ? { "aria-hidden": "true" } : {})}
      {...props}
    />
  )),
}))

describe("Separator", () => {
  it("renders with default props", () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute("data-slot", "separator")
    expect(separator).toHaveAttribute("role", "separator")
  })

  it("renders with horizontal orientation by default", () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).toHaveAttribute("data-orientation", "horizontal")
    expect(separator).toHaveAttribute("aria-orientation", "horizontal")
  })

  it("renders with vertical orientation when specified", () => {
    render(<Separator orientation="vertical" data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).toHaveAttribute("data-orientation", "vertical")
    expect(separator).toHaveAttribute("aria-orientation", "vertical")
  })

  it("is decorative by default", () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).toHaveAttribute("aria-hidden", "true")
  })

  it("is not decorative when decorative is false", () => {
    render(<Separator decorative={false} data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).not.toHaveAttribute("aria-hidden", "true")
  })

  it("applies custom className", () => {
    render(<Separator className="custom-separator" data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).toHaveClass("custom-separator")
  })

  it("passes through additional HTML attributes", () => {
    render(
      <Separator 
        data-testid="separator"
        id="custom-id"
        aria-label="Custom separator"
      />
    )
    const separator = screen.getByTestId("separator")
    
    expect(separator).toHaveAttribute("id", "custom-id")
    expect(separator).toHaveAttribute("aria-label", "Custom separator")
  })

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Separator ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it("renders with data-slot attribute", () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId("separator")
    
    expect(separator).toHaveAttribute("data-slot", "separator")
  })
})

describe("Separator Orientation", () => {
  it("accepts horizontal orientation", () => {
    render(<Separator orientation="horizontal" data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "horizontal")
  })

  it("accepts vertical orientation", () => {
    render(<Separator orientation="vertical" data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "vertical")
  })

  it("maintains orientation when re-rendered", () => {
    const { rerender } = render(<Separator orientation="horizontal" data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "horizontal")
    
    rerender(<Separator orientation="vertical" data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "vertical")
  })
})

describe("Separator Accessibility", () => {
  it("has separator role for screen readers", () => {
    render(<Separator data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("role", "separator")
  })

  it("is hidden from screen readers when decorative", () => {
    render(<Separator decorative={true} data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("aria-hidden", "true")
  })

  it("is visible to screen readers when not decorative", () => {
    render(<Separator decorative={false} data-testid="separator" />)
    expect(screen.getByTestId("separator")).not.toHaveAttribute("aria-hidden")
  })

  it("includes aria-orientation for accessibility", () => {
    render(<Separator orientation="vertical" data-testid="separator" />)
    expect(screen.getByTestId("separator")).toHaveAttribute("aria-orientation", "vertical")
  })

  it("can have custom aria-label for non-decorative separators", () => {
    render(
      <Separator 
        decorative={false}
        aria-label="Section divider"
        data-testid="separator"
      />
    )
    expect(screen.getByTestId("separator")).toHaveAttribute("aria-label", "Section divider")
  })
})

describe("Separator Edge Cases", () => {
  it("handles undefined orientation gracefully", () => {
    render(<Separator orientation={undefined} data-testid="separator" />)
    // Should default to horizontal
    expect(screen.getByTestId("separator")).toHaveAttribute("data-orientation", "horizontal")
  })

  it("handles undefined decorative gracefully", () => {
    render(<Separator decorative={undefined} data-testid="separator" />)
    // Should default to true
    expect(screen.getByTestId("separator")).toHaveAttribute("aria-hidden", "true")
  })

  it("handles null className gracefully", () => {
    render(<Separator className={null as any} data-testid="separator" />)
    expect(screen.getByTestId("separator")).toBeInTheDocument()
  })

  it("handles empty className", () => {
    render(<Separator className="" data-testid="separator" />)
    expect(screen.getByTestId("separator")).toBeInTheDocument()
  })
})

describe("Separator Integration", () => {
  it("renders in a list context", () => {
    render(
      <ul>
        <li>Item 1</li>
        <Separator data-testid="separator" />
        <li>Item 2</li>
      </ul>
    )
    
    expect(screen.getByTestId("separator")).toBeInTheDocument()
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 2")).toBeInTheDocument()
  })

  it("renders multiple separators", () => {
    render(
      <div>
        <div>Section 1</div>
        <Separator data-testid="sep-1" />
        <div>Section 2</div>
        <Separator data-testid="sep-2" orientation="vertical" />
        <div>Section 3</div>
      </div>
    )
    
    expect(screen.getByTestId("sep-1")).toHaveAttribute("data-orientation", "horizontal")
    expect(screen.getByTestId("sep-2")).toHaveAttribute("data-orientation", "vertical")
  })

  it("works with different styling contexts", () => {
    render(
      <div className="flex flex-col gap-4">
        <div>Content 1</div>
        <Separator className="my-4" data-testid="separator" />
        <div>Content 2</div>
      </div>
    )
    
    expect(screen.getByTestId("separator")).toHaveClass("my-4")
  })
})