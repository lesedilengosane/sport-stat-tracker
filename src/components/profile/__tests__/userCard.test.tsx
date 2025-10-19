// __tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import UserCard from '../UserCard';

describe('UserCard', () => {
  const defaultProps = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Coach',
  };

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<UserCard {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display user name correctly', () => {
      render(<UserCard {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display user email correctly', () => {
      render(<UserCard {...defaultProps} />);
      
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should display user role correctly', () => {
      render(<UserCard {...defaultProps} />);
      
      expect(screen.getByText('Coach')).toBeInTheDocument();
    });

    it('should display "Role" label', () => {
      render(<UserCard {...defaultProps} />);
      
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should display avatar with first letter of name', () => {
      render(<UserCard {...defaultProps} />);
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should display avatar with uppercase first letter', () => {
      render(<UserCard name="alice smith" email="alice@test.com" role="Fan" />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('Avatar Initials', () => {
    it('should display correct initial for single word name', () => {
      render(<UserCard name="Alice" email="alice@test.com" role="Fan" />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should display first letter of first name for multi-word name', () => {
      render(<UserCard name="Bob Johnson" email="bob@test.com" role="Analyst" />);
      
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should display "U" when name is empty string', () => {
      render(<UserCard name="" email="test@test.com" role="Fan" />);
      
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should display "U" when name is null', () => {
      render(<UserCard name={null as any} email="test@test.com" role="Fan" />);
      
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should display "U" when name is undefined', () => {
      render(<UserCard name={undefined as any} email="test@test.com" role="Fan" />);
      
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should handle lowercase name correctly', () => {
      render(<UserCard name="charlie" email="charlie@test.com" role="Coach" />);
      
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should handle name with leading space', () => {
      const { container } = render(<UserCard name=" David" email="david@test.com" role="Analyst" />);
      
      // The component doesn't trim the name, so the first character is a space
      // charAt(0).toUpperCase() on a space returns a space, which is truthy
      // So the avatar shows an empty-looking space character
      const avatar = container.querySelector('.bg-gradient-to-tr.from-orange-500');
      expect(avatar).toBeInTheDocument();
      expect(avatar?.textContent?.trim()).toBe('');
    });

    it('should handle special characters in name', () => {
      render(<UserCard name="Ñoño Martinez" email="nono@test.com" role="Fan" />);
      
      expect(screen.getByText('Ñ')).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('should display "Unknown User" when name is empty', () => {
      render(<UserCard name="" email="test@test.com" role="Fan" />);
      
      expect(screen.getByText('Unknown User')).toBeInTheDocument();
    });

    it('should display "Unknown User" when name is null', () => {
      render(<UserCard name={null as any} email="test@test.com" role="Fan" />);
      
      expect(screen.getByText('Unknown User')).toBeInTheDocument();
    });

    it('should display "No email" when email is empty', () => {
      render(<UserCard name="John Doe" email="" role="Coach" />);
      
      expect(screen.getByText('No email')).toBeInTheDocument();
    });

    it('should display "No email" when email is null', () => {
      render(<UserCard name="John Doe" email={null as any} role="Coach" />);
      
      expect(screen.getByText('No email')).toBeInTheDocument();
    });

    it('should display "User" when role is empty', () => {
      render(<UserCard name="John Doe" email="john@test.com" role="" />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should display "User" when role is null', () => {
      render(<UserCard name="John Doe" email="john@test.com" role={null as any} />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('Role Styling', () => {
    it('should apply Coach styling when role is Coach', () => {
      render(<UserCard {...defaultProps} role="Coach" />);
      
      const roleElement = screen.getByText('Coach');
      expect(roleElement).toHaveClass('bg-green-700');
      expect(roleElement).toHaveClass('text-green-100');
    });

    it('should apply Analyst styling when role is Analyst', () => {
      render(<UserCard name="Jane" email="jane@test.com" role="Analyst" />);
      
      const roleElement = screen.getByText('Analyst');
      expect(roleElement).toHaveClass('bg-blue-700');
      expect(roleElement).toHaveClass('text-blue-100');
    });

    it('should apply Fan styling when role is Fan', () => {
      render(<UserCard name="Bob" email="bob@test.com" role="Fan" />);
      
      const roleElement = screen.getByText('Fan');
      expect(roleElement).toHaveClass('bg-purple-700');
      expect(roleElement).toHaveClass('text-purple-100');
    });

    it('should apply default styling for unknown role', () => {
      render(<UserCard name="Alice" email="alice@test.com" role="Admin" />);
      
      const roleElement = screen.getByText('Admin');
      expect(roleElement).toHaveClass('bg-gray-700');
      expect(roleElement).toHaveClass('text-gray-100');
    });

    it('should apply default styling for empty role', () => {
      render(<UserCard name="John" email="john@test.com" role="" />);
      
      const roleElement = screen.getByText('User');
      expect(roleElement).toHaveClass('bg-gray-700');
      expect(roleElement).toHaveClass('text-gray-100');
    });

    it('should apply common role styling classes', () => {
      render(<UserCard {...defaultProps} />);
      
      const roleElement = screen.getByText('Coach');
      expect(roleElement).toHaveClass('inline-block');
      expect(roleElement).toHaveClass('px-5');
      expect(roleElement).toHaveClass('py-1.5');
      expect(roleElement).toHaveClass('rounded-full');
      expect(roleElement).toHaveClass('text-sm');
      expect(roleElement).toHaveClass('font-semibold');
    });

    it('should be case-sensitive for role styling', () => {
      render(<UserCard name="Test" email="test@test.com" role="coach" />);
      
      const roleElement = screen.getByText('coach');
      expect(roleElement).toHaveClass('bg-gray-700');
      expect(roleElement).toHaveClass('text-gray-100');
    });
  });

  describe('UI Structure', () => {
    it('should render section element', () => {
      const { container } = render(<UserCard {...defaultProps} />);
      
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should apply correct styling to main section', () => {
      const { container } = render(<UserCard {...defaultProps} />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('group');
      expect(section).toHaveClass('relative');
      expect(section).toHaveClass('bg-gradient-to-br');
      expect(section).toHaveClass('rounded-3xl');
      expect(section).toHaveClass('shadow-2xl');
    });

    it('should render avatar container with correct styling', () => {
      const { container } = render(<UserCard {...defaultProps} />);
      
      // Find the avatar div directly by looking for the div with the gradient classes
      const avatar = container.querySelector('.bg-gradient-to-tr.from-orange-500');
      expect(avatar).toHaveClass('w-24');
      expect(avatar).toHaveClass('h-24');
      expect(avatar).toHaveClass('rounded-full');
      expect(avatar).toHaveClass('bg-gradient-to-tr');
    });

    it('should render online status indicator', () => {
      const { container } = render(<UserCard {...defaultProps} />);
      
      const avatar = screen.getByText('J').parentElement;
      const statusIndicator = avatar?.querySelector('.bg-green-500');
      expect(statusIndicator).toBeInTheDocument();
      expect(statusIndicator).toHaveClass('w-6');
      expect(statusIndicator).toHaveClass('h-6');
      expect(statusIndicator).toHaveClass('rounded-full');
    });

    it('should render divider', () => {
      const { container } = render(<UserCard {...defaultProps} />);
      
      const divider = container.querySelector('.border-t.border-gray-700');
      expect(divider).toBeInTheDocument();
    });

    it('should apply hover effects to name', () => {
      render(<UserCard {...defaultProps} />);
      
      const nameElement = screen.getByText('John Doe');
      expect(nameElement).toHaveClass('group-hover:text-white');
    });

    it('should apply hover effects to avatar', () => {
      const { container } = render(<UserCard {...defaultProps} />);
      
      // Find the avatar div directly by looking for the div with the gradient classes
      const avatar = container.querySelector('.bg-gradient-to-tr.from-orange-500');
      expect(avatar).toHaveClass('group-hover:scale-105');
    });
  });

  describe('Email Styling', () => {
    it('should apply correct styling to email', () => {
      render(<UserCard {...defaultProps} />);
      
      const emailElement = screen.getByText('john.doe@example.com');
      expect(emailElement).toHaveClass('text-gray-400');
      expect(emailElement).toHaveClass('text-sm');
    });
  });

  describe('Name Styling', () => {
    it('should apply correct styling to name', () => {
      render(<UserCard {...defaultProps} />);
      
      const nameElement = screen.getByText('John Doe');
      expect(nameElement).toHaveClass('text-2xl');
      expect(nameElement).toHaveClass('font-semibold');
      expect(nameElement).toHaveClass('text-gray-100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', () => {
      const longName = 'Alexander Christopher Benjamin Montgomery III';
      render(<UserCard name={longName} email="alex@test.com" role="Coach" />);
      
      expect(screen.getByText(longName)).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle very long emails', () => {
      const longEmail = 'very.long.email.address.that.exceeds.normal.length@example.com';
      render(<UserCard name="John" email={longEmail} role="Coach" />);
      
      expect(screen.getByText(longEmail)).toBeInTheDocument();
    });

    it('should handle special characters in email', () => {
      render(<UserCard name="John" email="john+test@example.com" role="Coach" />);
      
      expect(screen.getByText('john+test@example.com')).toBeInTheDocument();
    });

    it('should handle name with numbers', () => {
      render(<UserCard name="John123 Doe" email="john@test.com" role="Coach" />);
      
      expect(screen.getByText('John123 Doe')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should handle role with spaces', () => {
      render(<UserCard name="John" email="john@test.com" role="Team Coach" />);
      
      const roleElement = screen.getByText('Team Coach');
      expect(roleElement).toHaveClass('bg-gray-700');
    });

    it('should handle empty spaces in name', () => {
      const { container } = render(<UserCard name="   " email="test@test.com" role="Fan" />);
      
      // The component uses `name || "Unknown User"` but "   " is truthy
      // So it displays the spaces, not "Unknown User"
      // The avatar shows a space because charAt(0).toUpperCase() on a space returns a space
      const avatar = container.querySelector('.bg-gradient-to-tr.from-orange-500');
      expect(avatar).toBeInTheDocument();
      expect(avatar?.textContent?.trim()).toBe('');
    });

    it('should handle name starting with number', () => {
      render(<UserCard name="123 Test" email="test@test.com" role="Fan" />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle emoji in name', () => {
      render(<UserCard name="😀 Happy User" email="happy@test.com" role="Fan" />);
      
      expect(screen.getByText('😀 Happy User')).toBeInTheDocument();
    });
  });

  describe('Multiple Role Values', () => {
    it.each([
      ['Coach', 'bg-green-700', 'text-green-100'],
      ['Analyst', 'bg-blue-700', 'text-blue-100'],
      ['Fan', 'bg-purple-700', 'text-purple-100'],
      ['Admin', 'bg-gray-700', 'text-gray-100'],
      ['Manager', 'bg-gray-700', 'text-gray-100'],
      ['', 'bg-gray-700', 'text-gray-100'],
    ])('should apply correct styling for role "%s"', (role, bgClass, textClass) => {
      render(<UserCard name="Test User" email="test@test.com" role={role} />);
      
      const displayText = role || 'User';
      const roleElement = screen.getByText(displayText);
      expect(roleElement).toHaveClass(bgClass);
      expect(roleElement).toHaveClass(textClass);
    });
  });

  describe('Component Integration', () => {
    it('should render all sections together', () => {
      render(<UserCard {...defaultProps} />);
      
      // Avatar section
      expect(screen.getByText('J')).toBeInTheDocument();
      
      // Name and email section
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      
      // Role section
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Coach')).toBeInTheDocument();
    });

    it('should render correctly with all default values', () => {
      render(<UserCard name="" email="" role="" />);
      
      expect(screen.getByText('U')).toBeInTheDocument();
      expect(screen.getByText('Unknown User')).toBeInTheDocument();
      expect(screen.getByText('No email')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });
});