import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders name', () => {
    render(<App />);
    expect(screen.queryByText('Jordan Floyd')).toBeInTheDocument();
  });
});
