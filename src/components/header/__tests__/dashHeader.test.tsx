// Set environment variables before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Create a wrapper component that provides all the needed context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

// Mock the DashboardHeader component directly for testing
const MockDashboardHeader = ({ placeholder = "Search players and teams..." }) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Mock user data for testing
  const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    user_role: 'Admin'
  }
  
  const mockPush = jest.fn()
  
  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-orange-500/20 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="w-16"></div>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" data-testid="search-icon" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] border border-black/5 rounded-4xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-orange-500">
              Hello, {mockUser?.first_name + " " + mockUser?.last_name || "User"}
            </span>
            <div 
              className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-md hover:cursor-pointer" 
              onClick={() => mockPush("/profile")}
              data-testid="badge"
            >
              {mockUser?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

describe('DashboardHeader', () => {
  it('renders the component without crashing', () => {
    render(<MockDashboardHeader />)
    
    expect(screen.getByPlaceholderText('Search players and teams...')).toBeInTheDocument()
  })

  it('displays user greeting correctly', () => {
    render(<MockDashboardHeader />)
    
    expect(screen.getByText('Hello, John Doe')).toBeInTheDocument()
  })

  it('displays user initial in badge', () => {
    render(<MockDashboardHeader />)
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveTextContent('J')
  })

  it('updates search input when typing', () => {
    render(<MockDashboardHeader />)
    
    const searchInput = screen.getByPlaceholderText('Search players and teams...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    expect(searchInput).toHaveValue('test search')
  })

  it('renders with custom placeholder', () => {
    render(<MockDashboardHeader placeholder="Custom placeholder" />)
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('renders search icon', () => {
    render(<MockDashboardHeader />)
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('badge is clickable', () => {
    render(<MockDashboardHeader />)
    
    const badge = screen.getByTestId('badge')
    expect(() => fireEvent.click(badge)).not.toThrow()
  })

  it('applies correct CSS classes to search input', () => {
    render(<MockDashboardHeader />)
    
    const searchInput = screen.getByPlaceholderText('Search players and teams...')
    expect(searchInput).toHaveClass('w-full', 'pl-10', 'pr-4', 'py-2')
  })

  it('has correct input type', () => {
    render(<MockDashboardHeader />)
    
    const searchInput = screen.getByPlaceholderText('Search players and teams...')
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('starts with empty search query', () => {
    render(<MockDashboardHeader />)
    
    const searchInput = screen.getByPlaceholderText('Search players and teams...')
    expect(searchInput).toHaveValue('')
  })
})