import * as React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from "../item"

// Mock dependencies
jest.mock("../../../lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}))

jest.mock("../separator", () => ({
  Separator: ({ className, orientation, ...props }: any) => (
    <hr className={className} data-orientation={orientation} {...props} />
  ),
}))

jest.mock("@radix-ui/react-slot", () => ({
  Slot: React.forwardRef(({ children, ...props }: any, ref: any) => {
    // Slot merges props with the child element
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { 
        ...props, 
        ...(typeof children.props === 'object' ? children.props : {}), 
        ref 
      })
    }
    return children
  }),
}))

describe("ItemGroup", () => {
  it("renders with correct role and data attribute", () => {
    render(<ItemGroup data-testid="item-group">Content</ItemGroup>)
    const group = screen.getByTestId("item-group")
    expect(group).toHaveAttribute("role", "list")
    expect(group).toHaveAttribute("data-slot", "item-group")
  })

  it("applies custom className", () => {
    render(<ItemGroup className="custom-class" data-testid="item-group" />)
    expect(screen.getByTestId("item-group")).toHaveClass("custom-class")
  })

  it("renders children correctly", () => {
    render(
      <ItemGroup>
        <div>Child 1</div>
        <div>Child 2</div>
      </ItemGroup>
    )
    expect(screen.getByText("Child 1")).toBeInTheDocument()
    expect(screen.getByText("Child 2")).toBeInTheDocument()
  })
})

describe("ItemSeparator", () => {
  it("renders separator with correct data attribute", () => {
    const { container } = render(<ItemSeparator />)
    const separator = container.querySelector('[data-slot="item-separator"]')
    expect(separator).toBeInTheDocument()
  })

  it("renders with horizontal orientation", () => {
    const { container } = render(<ItemSeparator />)
    const separator = container.querySelector("hr")
    expect(separator).toHaveAttribute("data-orientation", "horizontal")
  })

  it("applies custom className", () => {
    const { container } = render(<ItemSeparator className="custom-separator" />)
    const separator = container.querySelector("hr")
    expect(separator).toHaveClass("custom-separator")
  })
})

describe("Item", () => {
  it("renders with default variant and size", () => {
    render(<Item data-testid="item">Content</Item>)
    const item = screen.getByTestId("item")
    expect(item).toHaveAttribute("data-slot", "item")
    expect(item).toHaveAttribute("data-variant", "default")
    expect(item).toHaveAttribute("data-size", "default")
  })

  it("renders with outline variant", () => {
    render(<Item variant="outline" data-testid="item">Content</Item>)
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "outline")
  })

  it("renders with muted variant", () => {
    render(<Item variant="muted" data-testid="item">Content</Item>)
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "muted")
  })

  it("renders with small size", () => {
    render(<Item size="sm" data-testid="item">Content</Item>)
    expect(screen.getByTestId("item")).toHaveAttribute("data-size", "sm")
  })

  it("applies custom className", () => {
    render(<Item className="custom-item" data-testid="item" />)
    expect(screen.getByTestId("item")).toHaveClass("custom-item")
  })

  it("renders as child component when asChild is true", () => {
    render(
      <Item asChild data-testid="item">
        <button>Click me</button>
      </Item>
    )
    const button = screen.getByRole("button")
    // When asChild is true, the Item props should be applied to the button
    expect(button).toHaveAttribute("data-slot", "item")
    expect(button).toHaveAttribute("data-variant", "default")
    expect(button).toHaveAttribute("data-size", "default")
  })

  it("renders children correctly", () => {
    render(<Item>Test Content</Item>)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })
})

describe("ItemMedia", () => {
  it("renders with default variant", () => {
    render(<ItemMedia data-testid="media">Icon</ItemMedia>)
    const media = screen.getByTestId("media")
    expect(media).toHaveAttribute("data-slot", "item-media")
    expect(media).toHaveAttribute("data-variant", "default")
  })

  it("renders with icon variant", () => {
    render(<ItemMedia variant="icon" data-testid="media">Icon</ItemMedia>)
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "icon")
  })

  it("renders with image variant", () => {
    render(<ItemMedia variant="image" data-testid="media">Image</ItemMedia>)
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "image")
  })

  it("applies custom className", () => {
    render(<ItemMedia className="custom-media" data-testid="media" />)
    expect(screen.getByTestId("media")).toHaveClass("custom-media")
  })

  it("renders children correctly", () => {
    render(<ItemMedia><span>Media Content</span></ItemMedia>)
    expect(screen.getByText("Media Content")).toBeInTheDocument()
  })
})

describe("ItemContent", () => {
  it("renders with correct data attribute", () => {
    render(<ItemContent data-testid="content">Content</ItemContent>)
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "item-content")
  })

  it("applies custom className", () => {
    render(<ItemContent className="custom-content" data-testid="content" />)
    expect(screen.getByTestId("content")).toHaveClass("custom-content")
  })

  it("renders children correctly", () => {
    render(
      <ItemContent>
        <div>Child 1</div>
        <div>Child 2</div>
      </ItemContent>
    )
    expect(screen.getByText("Child 1")).toBeInTheDocument()
    expect(screen.getByText("Child 2")).toBeInTheDocument()
  })
})

describe("ItemTitle", () => {
  it("renders with correct data attribute", () => {
    render(<ItemTitle data-testid="title">Title</ItemTitle>)
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "item-title")
  })

  it("applies custom className", () => {
    render(<ItemTitle className="custom-title" data-testid="title" />)
    expect(screen.getByTestId("title")).toHaveClass("custom-title")
  })

  it("renders text content", () => {
    render(<ItemTitle>Test Title</ItemTitle>)
    expect(screen.getByText("Test Title")).toBeInTheDocument()
  })
})

describe("ItemDescription", () => {
  it("renders as paragraph element", () => {
    render(<ItemDescription data-testid="description">Description</ItemDescription>)
    const desc = screen.getByTestId("description")
    expect(desc.tagName).toBe("P")
    expect(desc).toHaveAttribute("data-slot", "item-description")
  })

  it("applies custom className", () => {
    render(<ItemDescription className="custom-desc" data-testid="description" />)
    expect(screen.getByTestId("description")).toHaveClass("custom-desc")
  })

  it("renders text content", () => {
    render(<ItemDescription>Test Description</ItemDescription>)
    expect(screen.getByText("Test Description")).toBeInTheDocument()
  })
})

describe("ItemActions", () => {
  it("renders with correct data attribute", () => {
    render(<ItemActions data-testid="actions">Actions</ItemActions>)
    expect(screen.getByTestId("actions")).toHaveAttribute("data-slot", "item-actions")
  })

  it("applies custom className", () => {
    render(<ItemActions className="custom-actions" data-testid="actions" />)
    expect(screen.getByTestId("actions")).toHaveClass("custom-actions")
  })

  it("renders children correctly", () => {
    render(
      <ItemActions>
        <button>Action 1</button>
        <button>Action 2</button>
      </ItemActions>
    )
    expect(screen.getByText("Action 1")).toBeInTheDocument()
    expect(screen.getByText("Action 2")).toBeInTheDocument()
  })
})

describe("ItemHeader", () => {
  it("renders with correct data attribute", () => {
    render(<ItemHeader data-testid="header">Header</ItemHeader>)
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "item-header")
  })

  it("applies custom className", () => {
    render(<ItemHeader className="custom-header" data-testid="header" />)
    expect(screen.getByTestId("header")).toHaveClass("custom-header")
  })

  it("renders children correctly", () => {
    render(<ItemHeader>Header Content</ItemHeader>)
    expect(screen.getByText("Header Content")).toBeInTheDocument()
  })
})

describe("ItemFooter", () => {
  it("renders with correct data attribute", () => {
    render(<ItemFooter data-testid="footer">Footer</ItemFooter>)
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "item-footer")
  })

  it("applies custom className", () => {
    render(<ItemFooter className="custom-footer" data-testid="footer" />)
    expect(screen.getByTestId("footer")).toHaveClass("custom-footer")
  })

  it("renders children correctly", () => {
    render(<ItemFooter>Footer Content</ItemFooter>)
    expect(screen.getByText("Footer Content")).toBeInTheDocument()
  })
})

describe("Integration Tests", () => {
  it("renders a complete item structure", () => {
    render(
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <svg data-testid="icon" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Item Title</ItemTitle>
          <ItemDescription>Item Description</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button>Action</button>
        </ItemActions>
      </Item>
    )

    expect(screen.getByText("Item Title")).toBeInTheDocument()
    expect(screen.getByText("Item Description")).toBeInTheDocument()
    expect(screen.getByText("Action")).toBeInTheDocument()
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("renders item group with multiple items and separator", () => {
    render(
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>First Item</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Second Item</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    )

    expect(screen.getByText("First Item")).toBeInTheDocument()
    expect(screen.getByText("Second Item")).toBeInTheDocument()
  })

  it("renders item with header and footer", () => {
    render(
      <Item>
        <ItemHeader>
          <ItemTitle>Header Title</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <ItemDescription>Main Content</ItemDescription>
        </ItemContent>
        <ItemFooter>
          <span>Footer Text</span>
        </ItemFooter>
      </Item>
    )

    expect(screen.getByText("Header Title")).toBeInTheDocument()
    expect(screen.getByText("Main Content")).toBeInTheDocument()
    expect(screen.getByText("Footer Text")).toBeInTheDocument()
  })

  it("renders complex nested structure with all components", () => {
    render(
      <ItemGroup data-testid="group">
        <Item variant="muted" size="default">
          <ItemHeader>
            <ItemMedia variant="image">
              <img src="test.jpg" alt="Test" />
            </ItemMedia>
            <ItemActions>
              <button>Edit</button>
            </ItemActions>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>Complex Item</ItemTitle>
            <ItemDescription>With all components</ItemDescription>
          </ItemContent>
          <ItemFooter>
            <span>Footer info</span>
          </ItemFooter>
        </Item>
      </ItemGroup>
    )

    expect(screen.getByTestId("group")).toBeInTheDocument()
    expect(screen.getByText("Complex Item")).toBeInTheDocument()
    expect(screen.getByText("With all components")).toBeInTheDocument()
    expect(screen.getByText("Edit")).toBeInTheDocument()
    expect(screen.getByAltText("Test")).toBeInTheDocument()
    expect(screen.getByText("Footer info")).toBeInTheDocument()
  })

  it("handles multiple ItemContent components in same Item", () => {
    render(
      <Item>
        <ItemContent>
          <ItemTitle>First Content</ItemTitle>
        </ItemContent>
        <ItemContent>
          <ItemTitle>Second Content</ItemTitle>
        </ItemContent>
      </Item>
    )

    expect(screen.getByText("First Content")).toBeInTheDocument()
    expect(screen.getByText("Second Content")).toBeInTheDocument()
  })
})

describe("Edge Cases", () => {
  it("renders Item without children", () => {
    render(<Item data-testid="empty-item" />)
    expect(screen.getByTestId("empty-item")).toBeInTheDocument()
  })

  it("renders ItemGroup without children", () => {
    render(<ItemGroup data-testid="empty-group" />)
    expect(screen.getByTestId("empty-group")).toBeInTheDocument()
  })

  it("handles undefined variant and size gracefully", () => {
    render(
      <Item variant={undefined} size={undefined} data-testid="item">
        Content
      </Item>
    )
    const item = screen.getByTestId("item")
    expect(item).toHaveAttribute("data-variant", "default")
    expect(item).toHaveAttribute("data-size", "default")
  })

  it("passes through additional HTML attributes", () => {
    render(
      <Item data-testid="item" id="custom-id" aria-label="Custom label">
        Content
      </Item>
    )
    const item = screen.getByTestId("item")
    expect(item).toHaveAttribute("id", "custom-id")
    expect(item).toHaveAttribute("aria-label", "Custom label")
  })

  it("forwards ref correctly when using asChild", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Item asChild>
        <button ref={ref}>Button</button>
      </Item>
    )
    expect(screen.getByRole("button")).toBeInTheDocument()
  })
})

describe("Variant Combinations", () => {
  it("renders all Item variant combinations", () => {
    const { rerender } = render(
      <Item variant="default" size="default" data-testid="item" />
    )
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "default")
    expect(screen.getByTestId("item")).toHaveAttribute("data-size", "default")

    rerender(<Item variant="outline" size="sm" data-testid="item" />)
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "outline")
    expect(screen.getByTestId("item")).toHaveAttribute("data-size", "sm")

    rerender(<Item variant="muted" size="default" data-testid="item" />)
    expect(screen.getByTestId("item")).toHaveAttribute("data-variant", "muted")
  })

  it("renders all ItemMedia variants", () => {
    const { rerender } = render(
      <ItemMedia variant="default" data-testid="media" />
    )
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "default")

    rerender(<ItemMedia variant="icon" data-testid="media" />)
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "icon")

    rerender(<ItemMedia variant="image" data-testid="media" />)
    expect(screen.getByTestId("media")).toHaveAttribute("data-variant", "image")
  })
})

describe("Accessibility", () => {
  it("ItemGroup has list role for screen readers", () => {
    render(<ItemGroup data-testid="group" />)
    expect(screen.getByTestId("group")).toHaveAttribute("role", "list")
  })

  it("preserves aria attributes on Item", () => {
    render(
      <Item 
        data-testid="item"
        aria-describedby="description-id"
        aria-labelledby="title-id"
      >
        Content
      </Item>
    )
    const item = screen.getByTestId("item")
    expect(item).toHaveAttribute("aria-describedby", "description-id")
    expect(item).toHaveAttribute("aria-labelledby", "title-id")
  })

  it("ItemDescription uses paragraph element for proper semantics", () => {
    render(<ItemDescription data-testid="desc">Description</ItemDescription>)
    expect(screen.getByTestId("desc").tagName).toBe("P")
  })
})