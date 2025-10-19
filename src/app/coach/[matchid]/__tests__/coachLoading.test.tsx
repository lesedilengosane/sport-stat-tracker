import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('Loading Component', () => {
  it('should render without crashing', () => {
    render(<Loading />);
    expect(screen.getByText('Loading match details...')).toBeInTheDocument();
  });

  it('should display the loading title', () => {
    render(<Loading />);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Loading match details...');
  });

  it('should display the loading message', () => {
    render(<Loading />);
    const message = screen.getByText('Please wait while we fetch all match information.');
    expect(message).toBeInTheDocument();
  });

  it('should have correct container styling classes', () => {
    const { container } = render(<Loading />);
    const mainDiv = container.firstChild as HTMLElement;
    
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('items-center');
    expect(mainDiv).toHaveClass('justify-center');
    expect(mainDiv).toHaveClass('min-h-screen');
    expect(mainDiv).toHaveClass('bg-black');
  });

  it('should have animate-bounce class on the content wrapper', () => {
    const { container } = render(<Loading />);
    const animatedDiv = container.querySelector('.animate-bounce');
    
    expect(animatedDiv).toBeInTheDocument();
    expect(animatedDiv).toHaveClass('text-center');
  });

  it('should render the orange circular loader', () => {
    const { container } = render(<Loading />);
    const loader = container.querySelector('.bg-orange-500.rounded-full');
    
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass('w-12');
    expect(loader).toHaveClass('h-12');
    expect(loader).toHaveClass('mx-auto');
    expect(loader).toHaveClass('mb-6');
  });

  it('should have orange styling on the title', () => {
    render(<Loading />);
    const title = screen.getByRole('heading', { level: 1 });
    
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-bold');
    expect(title).toHaveClass('text-orange-500');
    expect(title).toHaveClass('mb-2');
  });

  it('should have gray styling on the description text', () => {
    render(<Loading />);
    const description = screen.getByText('Please wait while we fetch all match information.');
    
    expect(description).toHaveClass('text-gray-300');
  });

  it('should render all elements in the correct order', () => {
    const { container } = render(<Loading />);
    const animatedDiv = container.querySelector('.animate-bounce');
    const children = animatedDiv?.children;
    
    expect(children).toHaveLength(3);
    expect(children?.[0]).toHaveClass('bg-orange-500');
    expect(children?.[1].tagName).toBe('H1');
    expect(children?.[2].tagName).toBe('P');
  });

  it('should match snapshot', () => {
    const { container } = render(<Loading />);
    expect(container).toMatchSnapshot();
  });
});