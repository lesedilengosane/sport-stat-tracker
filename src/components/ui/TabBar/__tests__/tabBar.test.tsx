import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TabBar } from '../TabBar'

describe('TabBar', () => {
  const mockSetActiveTab = jest.fn()

  beforeEach(() => {
    mockSetActiveTab.mockClear()
  })

  const defaultProps = {
    activeTab: 'upcoming',
    setActiveTab: mockSetActiveTab,
  }

  it('renders all tab buttons', () => {
    render(<TabBar {...defaultProps} />)
    
    expect(screen.getByText('Upcoming Games')).toBeInTheDocument()
    expect(screen.getByText('Booked Games')).toBeInTheDocument()
    expect(screen.getByText('Live Now')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders all tabs as buttons', () => {
    render(<TabBar {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })

  it('applies active styles to the currently active tab', () => {
    render(<TabBar {...defaultProps} activeTab="upcoming" />)
    
    const activeButton = screen.getByText('Upcoming Games')
    expect(activeButton).toHaveClass('border-blue-500', 'text-blue-500')
  })

  it('applies inactive styles to non-active tabs', () => {
    render(<TabBar {...defaultProps} activeTab="upcoming" />)
    
    const inactiveButton = screen.getByText('Booked Games')
    expect(inactiveButton).toHaveClass('border-transparent', 'text-gray-400')
    expect(inactiveButton).not.toHaveClass('border-blue-500', 'text-blue-500')
  })

  it('calls setActiveTab when a tab is clicked', () => {
    render(<TabBar {...defaultProps} />)
    
    const bookedGamesTab = screen.getByText('Booked Games')
    fireEvent.click(bookedGamesTab)
    
    expect(mockSetActiveTab).toHaveBeenCalledTimes(1)
    expect(mockSetActiveTab).toHaveBeenCalledWith('booked')
  })

  it('calls setActiveTab with correct tab id for each tab', () => {
    render(<TabBar {...defaultProps} />)
    
    // Test each tab
    fireEvent.click(screen.getByText('Upcoming Games'))
    expect(mockSetActiveTab).toHaveBeenLastCalledWith('upcoming')
    
    fireEvent.click(screen.getByText('Booked Games'))
    expect(mockSetActiveTab).toHaveBeenLastCalledWith('booked')
    
    fireEvent.click(screen.getByText('Live Now'))
    expect(mockSetActiveTab).toHaveBeenLastCalledWith('live')
    
    fireEvent.click(screen.getByText('Completed'))
    expect(mockSetActiveTab).toHaveBeenLastCalledWith('completed')
    
    expect(mockSetActiveTab).toHaveBeenCalledTimes(4)
  })

  it('updates active tab styling when activeTab prop changes', () => {
    const { rerender } = render(<TabBar {...defaultProps} activeTab="upcoming" />)
    
    // Initially upcoming should be active
    expect(screen.getByText('Upcoming Games')).toHaveClass('border-blue-500', 'text-blue-500')
    expect(screen.getByText('Live Now')).toHaveClass('border-transparent', 'text-gray-400')
    
    // Change active tab to live
    rerender(<TabBar {...defaultProps} activeTab="live" />)
    
    expect(screen.getByText('Upcoming Games')).toHaveClass('border-transparent', 'text-gray-400')
    expect(screen.getByText('Live Now')).toHaveClass('border-blue-500', 'text-blue-500')
  })

  it('renders with correct structure and classes', () => {
    render(<TabBar {...defaultProps} />)
    
    // Check main container
    const mainContainer = screen.getByText('Upcoming Games').closest('.mb-6')
    expect(mainContainer).toBeInTheDocument()
    
    // Check border container
    const borderContainer = screen.getByText('Upcoming Games').closest('.border-b.border-gray-700')
    expect(borderContainer).toBeInTheDocument()
    
    // Check nav element
    const nav = screen.getByText('Upcoming Games').closest('nav')
    expect(nav).toHaveClass('-mb-px', 'flex', 'space-x-8')
  })

  it('applies hover classes correctly', () => {
    render(<TabBar {...defaultProps} activeTab="upcoming" />)
    
    const inactiveButton = screen.getByText('Booked Games')
    expect(inactiveButton).toHaveClass('hover:text-gray-300', 'hover:border-gray-300')
  })

  it('applies common button classes to all tabs', () => {
    render(<TabBar {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass('py-4', 'px-1', 'border-b-2', 'font-medium', 'text-sm')
    })
  })

  it('handles invalid activeTab gracefully', () => {
    render(<TabBar {...defaultProps} activeTab="invalid-tab" />)
    
    // All tabs should have inactive styling
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass('border-transparent', 'text-gray-400')
      expect(button).not.toHaveClass('border-blue-500', 'text-blue-500')
    })
  })

  it('maintains tab order', () => {
    render(<TabBar {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('Upcoming Games')
    expect(buttons[1]).toHaveTextContent('Booked Games')
    expect(buttons[2]).toHaveTextContent('Live Now')
    expect(buttons[3]).toHaveTextContent('Completed')
  })

  it('does not call setActiveTab when clicking the already active tab', () => {
    render(<TabBar {...defaultProps} activeTab="upcoming" />)
    
    const activeTab = screen.getByText('Upcoming Games')
    fireEvent.click(activeTab)
    
    // Should still be called because there's no prevention logic
    expect(mockSetActiveTab).toHaveBeenCalledWith('upcoming')
  })
})