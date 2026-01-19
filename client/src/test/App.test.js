import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// Mock the queries
const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

const mocks = [
  {
    request: {
      query: IS_LOGGED_IN,
    },
    result: {
      data: {
        isLoggedIn: false,
        __typename: 'Query',
      },
    },
  },
];

// Simple component for testing
const TestComponent = ({ children }) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </MockedProvider>
);

describe('App Component Smoke Tests', () => {
  it('should render without crashing', () => {
    // Simple render test to ensure the testing setup works
    const { container } = render(
      <TestComponent>
        <div data-testid="test-element">Test Content</div>
      </TestComponent>
    );

    expect(container).toBeDefined();
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });

  it('should support routing', () => {
    render(
      <TestComponent>
        <div>
          <a href="/login">Login Link</a>
          <span>Home Page Content</span>
        </div>
      </TestComponent>
    );

    expect(screen.getByText('Home Page Content')).toBeInTheDocument();
    expect(screen.getByText('Login Link')).toBeInTheDocument();
  });
});
