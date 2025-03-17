
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthButton } from '../auth-button';

describe('AuthButton', () => {
  it('renders login button', () => {
    render(<AuthButton />);
    expect(screen.getByText('Replit로 로그인')).toBeInTheDocument();
  });

  it('opens popup on click', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<AuthButton />);
    fireEvent.click(screen.getByText('Replit로 로그인'));
    expect(windowSpy).toHaveBeenCalled();
  });
});
