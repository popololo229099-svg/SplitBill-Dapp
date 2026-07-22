import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createElement } from 'react';
import WalletConnect from '../components/WalletConnect';

vi.mock('../context/WalletContext', () => ({
  useWallet: vi.fn(),
}));

import { useWallet } from '../context/WalletContext';
const mockUseWallet = vi.mocked(useWallet);

describe('WalletConnect', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders connect button when not connected', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders connected state with address', () => {
    mockUseWallet.mockReturnValue({
      address: 'GABC1234567890XYZ',
      balance: '100.00',
      isConnected: true,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText(/GABC12/)).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });

  it('shows connecting state', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: true,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows error banner when error exists', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: { type: 'wallet_not_found', message: 'No wallet found' },
      connect: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText('No wallet found')).toBeInTheDocument();
    expect(screen.getByText('Wallet Not Found')).toBeInTheDocument();
  });

  it('calls connect when connect button clicked', async () => {
    const user = userEvent.setup();
    const connectFn = vi.fn();

    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: connectFn,
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    await user.click(screen.getByText('Connect Wallet'));
    expect(connectFn).toHaveBeenCalledTimes(1);
  });

  it('calls disconnect when disconnect button clicked', async () => {
    const user = userEvent.setup();
    const disconnectFn = vi.fn();

    mockUseWallet.mockReturnValue({
      address: 'GABC1234567890XYZ',
      balance: '100.00',
      isConnected: true,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      disconnect: disconnectFn,
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    await user.click(screen.getByText('Disconnect'));
    expect(disconnectFn).toHaveBeenCalledTimes(1);
  });
});
