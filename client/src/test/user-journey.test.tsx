import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { UserJourney } from '@/components/ui/user-journey';

const mockProgress = {
  totalWatched: 5,
  totalRated: 3,
  watchTime: 7200, // 2 hours
  favoriteGenres: {},
  achievements: []
};

const mockAchievements = [
  {
    id: 1,
    achievementId: 'first-movie',
    progress: 100,
    completed: true,
    unlockedAt: new Date().toISOString()
  }
];

// Mock API responses
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn()
    .mockImplementation((queryKey) => {
      if (queryKey[0] === '/api/users/me/progress') {
        return { data: mockProgress, isLoading: false };
      }
      if (queryKey[0] === '/api/users/me/achievements') {
        return { data: mockAchievements, isLoading: false };
      }
      return { data: null, isLoading: true };
    })
}));

describe('UserJourney Component', () => {
  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserJourney />
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    jest.mock('@tanstack/react-query', () => ({
      useQuery: () => ({ isLoading: true })
    }));
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays user progress correctly', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('5편')).toBeInTheDocument(); // 시청한 영화
      expect(screen.getByText('3편')).toBeInTheDocument(); // 평가한 영화
      expect(screen.getByText('2시간 0분')).toBeInTheDocument(); // 총 시청 시간
    });
  });

  it('displays achievements correctly', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('첫 영화 시청')).toBeInTheDocument();
      expect(screen.getByText('달성!')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', () => {
    jest.mock('@tanstack/react-query', () => ({
      useQuery: () => ({ error: new Error('Failed to fetch'), isLoading: false })
    }));
    renderComponent();
    expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
  });
});
