import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { NavBar } from '@/components/ui/nav-bar';

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
};

// Mock react-query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockImplementation(() => ({
    data: mockUser,
    isLoading: false
  }))
}));

describe('NavBar Component', () => {
  const renderNavBar = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NavBar />
      </QueryClientProvider>
    );
  };

  it('renders the logo', () => {
    renderNavBar();
    expect(screen.getByText('NetflixClone')).toBeInTheDocument();
  });

  it('shows user avatar when logged in', () => {
    renderNavBar();
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of user name
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows login button when not logged in', () => {
    jest.mock('@tanstack/react-query', () => ({
      useQuery: () => ({ data: null, isLoading: false })
    }));
    renderNavBar();
    expect(screen.getByText('Sign In with Replit')).toBeInTheDocument();
  });

  it('shows mobile menu when hamburger is clicked', () => {
    renderNavBar();
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    expect(screen.getByText('영화')).toBeInTheDocument();
    expect(screen.getByText('TV 프로그램')).toBeInTheDocument();
    expect(screen.getByText('신작')).toBeInTheDocument();
  });

  it('handles scroll events correctly', () => {
    renderNavBar();
    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-background/95');
  });

  it('shows loading skeleton while fetching user data', () => {
    jest.mock('@tanstack/react-query', () => ({
      useQuery: () => ({ isLoading: true })
    }));
    renderNavBar();
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });
});
