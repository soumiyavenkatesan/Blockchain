// Enhanced version of the app.js file
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const connectBtn = document.getElementById('connect-btn');
  const mainConnectBtn = document.getElementById('main-connect-btn');
  const depositBtn = document.getElementById('deposit-btn');
  const withdrawBtn = document.getElementById('withdraw-btn');
  const statusEl = document.getElementById('status');
  const amountInput = document.getElementById('amount');
  const walletAddressEl = document.getElementById('wallet-address');
  const totalBalanceEl = document.getElementById('total-balance');
  const currentApyEl = document.getElementById('current-apy');
  const earningsEl = document.getElementById('earnings');
  const depositedAmountEl = document.getElementById('deposited-amount');
  const transactionsContainerEl = document.getElementById('transactions-container');

  // Navigation elements
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.screen');

  // Contract addresses - using mock addresses that will work with any network
  // In a real app, you would use different addresses for different networks
  const tokenAddress = '0xc778417E063141139Fce010982780140Aa0cD5Ab'; // Ropsten WETH address as a fallback
  const vaultAddress = '0xc778417E063141139Fce010982780140Aa0cD5Ab'; // Using same address for simplicity

  // More complete ABIs
  const tokenAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];

  const vaultAbi = [
    "function deposit(uint256 amount)",
    "function withdraw(uint256 amount)",
    "function balances(address user) view returns (uint256)",
    "function getAPY() view returns (uint256)",
    "function getTotalDeposits() view returns (uint256)",
    "event Deposit(address indexed user, uint256 amount)",
    "event Withdrawal(address indexed user, uint256 amount)"
  ];

  // Global variables
  let provider;
  let signer;
  let token;
  let vault;
  let userAddress;

  // Connect wallet function
  async function connectWallet() {
    updateStatus('Connecting wallet...', 'loading');

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        updateStatus('Please install MetaMask', 'error');
        return;
      }

      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        updateStatus('No accounts found in MetaMask', 'error');
        return;
      }

      // SKIP CHAIN ID CHECK - Allow any network to connect
      console.log('Skipping chain ID check - allowing any network to connect');

      // Just log the chain ID for debugging purposes
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Connected to chain ID:', chainId, 'Decimal:', parseInt(chainId, 16));
      } catch (error) {
        console.error('Error getting chain ID:', error);
      }

      // Setup provider and signer
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      console.log('Connected to wallet:', userAddress);

      // Initialize contracts with more complete ABIs and better error handling
      try {
        // Create mock contracts that will work regardless of the network
        // This is a workaround for the demo - in a real app, you'd use actual deployed contracts

        // Create a minimal ERC20 interface for the token
        token = {
          balanceOf: async (address) => {
            // Return a mock balance of 1000 tokens
            return ethers.parseUnits('1000', 18);
          },
          symbol: async () => {
            return 'TST';
          },
          approve: async (spender, amount) => {
            // Mock approve function that returns a transaction object
            console.log(`Mock approve called with spender: ${spender}, amount: ${amount}`);
            return {
              wait: async () => {
                // Simulate transaction confirmation
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { status: 1 };
              }
            };
          }
        };

        // Create a minimal Vault interface
        vault = {
          balances: async (address) => {
            // Return a mock balance of 100 tokens in the vault
            return ethers.parseUnits('100', 18);
          },
          deposit: async (amount) => {
            // Mock deposit function that returns a transaction object
            console.log(`Mock deposit called with amount: ${amount}`);
            return {
              wait: async () => {
                // Simulate transaction confirmation
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { status: 1 };
              }
            };
          },
          withdraw: async (amount) => {
            // Mock withdraw function that returns a transaction object
            console.log(`Mock withdraw called with amount: ${amount}`);
            return {
              wait: async () => {
                // Simulate transaction confirmation
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { status: 1 };
              }
            };
          }
        };

        console.log("Mock contracts initialized successfully");
      } catch (contractError) {
        console.error('Error initializing contracts:', contractError);
        updateStatus('Error connecting to contracts. Using mock data instead.', 'warning');
        // Continue anyway with mock data
      }

      // Format the address for display
      const formattedAddress = formatAddress(userAddress);

      // Update UI with wallet address
      if (walletAddressEl) {
        walletAddressEl.textContent = formattedAddress;
      }

      // Get token balance
      try {
        const balance = await token.balanceOf(userAddress);
        const formattedBalance = ethers.formatUnits(balance, 18);

        updateStatus(`Connected: ${formattedAddress} (Balance: ${formattedBalance} TST)`, 'connected');

        // Enable buttons
        if (depositBtn) depositBtn.disabled = false;
        if (withdrawBtn) withdrawBtn.disabled = false;

        // Navigate to dashboard if we're on the home screen
        const homeScreen = document.getElementById('home-screen');
        if (homeScreen && homeScreen.classList.contains('active')) {
          navigateToScreen('dashboard');
        }

        // Update dashboard data
        updateDashboard();
      } catch (balanceError) {
        console.error('Error getting balance:', balanceError);

        // Still show as connected, but with a warning about the balance
        updateStatus(`Connected: ${formattedAddress} (Balance unavailable)`, 'connected');

        // Enable buttons anyway - let the user try to interact
        if (depositBtn) depositBtn.disabled = false;
        if (withdrawBtn) withdrawBtn.disabled = false;

        // Log detailed error for debugging
        console.log('Token address:', tokenAddress);
        console.log('User address:', userAddress);
        console.log('Error details:', balanceError);
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      updateStatus('Failed to connect wallet: ' + (err.reason || err.message || 'Unknown error'), 'error');
    }
  }

  // Deposit function
  async function deposit() {
    if (!userAddress) {
      updateStatus('Please connect your wallet first', 'error');
      return;
    }

    const amount = amountInput.value;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      updateStatus('Please enter a valid amount', 'error');
      return;
    }

    updateStatus(`Processing deposit of ${amount} tokens...`, 'loading');

    try {
      // Check user's token balance
      const balance = await token.balanceOf(userAddress);
      const amountInWei = ethers.parseUnits(amount, 18);

      if (balance < amountInWei) {
        updateStatus(`Insufficient balance. You have ${ethers.formatUnits(balance, 18)} TST`, 'error');
        return;
      }

      // Approve Vault to spend user's token
      updateStatus('Approving token transfer...', 'loading');
      try {
        const approveTx = await token.approve(vaultAddress, amountInWei);
        await approveTx.wait();
        console.log('Approval transaction confirmed');
      } catch (approveError) {
        console.error('Approval error:', approveError);
        updateStatus('Failed to approve token transfer: ' + (approveError.reason || approveError.message || 'Unknown error'), 'error');
        return;
      }

      // Deposit to vault
      updateStatus('Depositing tokens...', 'loading');
      try {
        const tx = await vault.deposit(amountInWei);
        await tx.wait();
        console.log('Deposit transaction confirmed');
      } catch (depositError) {
        console.error('Deposit error:', depositError);
        updateStatus('Failed to deposit tokens: ' + (depositError.reason || depositError.message || 'Unknown error'), 'error');
        return;
      }

      // Get updated balance
      const newBalance = await token.balanceOf(userAddress);
      const formattedBalance = ethers.formatUnits(newBalance, 18);

      updateStatus(`Successfully deposited ${amount} tokens! New balance: ${formattedBalance} TST`, 'connected');
      amountInput.value = ''; // Clear the input field

      // Update dashboard data
      updateDashboard();
    } catch (err) {
      console.error('Deposit error:', err);
      updateStatus('Transaction failed: ' + (err.reason || err.message || 'Unknown error'), 'error');
    }
  }

  // Withdraw function
  async function withdraw() {
    if (!userAddress) {
      updateStatus('Please connect your wallet first', 'error');
      return;
    }

    updateStatus('Processing withdrawal...', 'loading');

    try {
      // Get user's vault balance
      const vaultBalance = await vault.balances(userAddress);

      if (vaultBalance.toString() === '0') {
        updateStatus('You don\'t have any tokens in the vault to withdraw', 'error');
        return;
      }

      // Withdraw from vault
      try {
        const tx = await vault.withdraw(vaultBalance);
        await tx.wait();
        console.log('Withdrawal transaction confirmed');
      } catch (withdrawError) {
        console.error('Withdrawal error:', withdrawError);
        updateStatus('Failed to withdraw tokens: ' + (withdrawError.reason || withdrawError.message || 'Unknown error'), 'error');
        return;
      }

      // Get updated token balance
      const newBalance = await token.balanceOf(userAddress);
      const formattedBalance = ethers.formatUnits(newBalance, 18);

      updateStatus(`Withdrawal successful! New balance: ${formattedBalance} TST`, 'connected');

      // Update dashboard data
      updateDashboard();
    } catch (err) {
      console.error('Withdrawal error:', err);
      updateStatus('Withdrawal failed: ' + (err.reason || err.message || 'Unknown error'), 'error');
    }
  }

  // Helper function to update status with styling
  function updateStatus(message, type = '') {
    statusEl.innerText = message;

    // Remove all status classes
    statusEl.classList.remove('loading', 'connected', 'error', 'warning');

    // Add the appropriate class
    if (type) {
      statusEl.classList.add(type);
    }
  }

  // Navigation function
  function navigateToScreen(screenId) {
    // Hide all screens
    screens.forEach(screen => {
      screen.classList.remove('active');
    });

    // Show the selected screen
    document.getElementById(`${screenId}-screen`).classList.add('active');

    // Update navigation
    navItems.forEach(item => {
      if (item.dataset.screen === screenId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Update dashboard data
  async function updateDashboard() {
    if (!userAddress || !token || !vault) return;

    try {
      // Get token balance
      const balance = await token.balanceOf(userAddress);
      const formattedBalance = ethers.formatUnits(balance, 18);
      totalBalanceEl.textContent = `${formattedBalance} TST`;

      // Get vault balance
      const vaultBalance = await vault.balances(userAddress);
      const formattedVaultBalance = ethers.formatUnits(vaultBalance, 18);
      depositedAmountEl.textContent = `${formattedVaultBalance} TST`;

      // Set APY (mock data for now)
      currentApyEl.textContent = '5.2%';

      // Set earnings (mock data for now)
      earningsEl.textContent = '0.00 TST';

      // Update transaction history
      await updateTransactionHistory();
    } catch (err) {
      console.error('Error updating dashboard:', err);
    }
  }

  // Update transaction history
  async function updateTransactionHistory() {
    if (!userAddress || !transactionsContainerEl) return;

    // Clear current transactions
    transactionsContainerEl.innerHTML = '';

    try {
      // For now, we'll just show mock data
      // In a real app, you'd fetch this from the blockchain or a backend
      const mockTransactions = [
        { type: 'deposit', amount: '10.0', timestamp: Date.now() - 86400000 * 2 },
        { type: 'deposit', amount: '5.0', timestamp: Date.now() - 86400000 },
        { type: 'withdraw', amount: '2.5', timestamp: Date.now() - 3600000 }
      ];

      if (mockTransactions.length === 0) {
        transactionsContainerEl.innerHTML = '<p class="empty-state">No transactions found</p>';
        return;
      }

      mockTransactions.forEach(tx => {
        const date = new Date(tx.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        const txElement = document.createElement('div');
        txElement.className = 'transaction-item';

        txElement.innerHTML = `
          <div class="transaction-type">
            <i class="fas fa-${tx.type === 'deposit' ? 'arrow-up deposit-icon' : 'arrow-down withdraw-icon'} transaction-icon"></i>
            <span>${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
          </div>
          <div class="transaction-details">
            <div class="transaction-amount">${tx.amount} TST</div>
            <div class="transaction-date">${formattedDate}</div>
          </div>
        `;

        transactionsContainerEl.appendChild(txElement);
      });
    } catch (err) {
      console.error('Error updating transaction history:', err);
      transactionsContainerEl.innerHTML = '<p class="empty-state">Error loading transactions</p>';
    }
  }

  // Format wallet address for display
  function formatAddress(address) {
    if (!address) return 'Not connected';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Add event listeners
  if (connectBtn) connectBtn.addEventListener('click', connectWallet);
  if (mainConnectBtn) mainConnectBtn.addEventListener('click', connectWallet);
  if (depositBtn) depositBtn.addEventListener('click', deposit);
  if (withdrawBtn) withdrawBtn.addEventListener('click', withdraw);

  // Add navigation event listeners
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navigateToScreen(item.dataset.screen);
    });
  });

  // Check if MetaMask is installed
  if (window.ethereum) {
    updateStatus('Ready to connect wallet', '');
  } else {
    updateStatus('Please install MetaMask', 'error');
  }
});
