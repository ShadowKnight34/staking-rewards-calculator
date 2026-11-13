import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import Dashboard from './views/dashboard/Dashboard';

test('renders dashboard with DeFi Staking Rewards Calculator', async () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </Provider>
  );

  const headings = await screen.findAllByText(/DeFi Staking Rewards Calculator/i);
  expect(headings.length).toBeGreaterThan(0);
  expect(headings[0]).toBeInTheDocument();
});


