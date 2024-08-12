import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Toast, ToastProvider } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";

// Your contract ABI and address
const CONTRACT_ADDRESS = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d';
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_xdaiTokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_entryFee",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "entryFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registerTeam",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "teamAddresses",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "teams",
    "outputs": [
      {
        "internalType": "address",
        "name": "manager",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "xdaiToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }]; // Your contract ABI goes here

function AppContent() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [teamId, setTeamId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
  
          const signer = await provider.getSigner();
          setAccount(await signer.getAddress());
  
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
          setContract(contract);
        } catch (error) {
          console.error("User denied account access or error occurred:", error);
          showToast("Error", "Failed to connect to wallet. Please try again.", "destructive");
        }
      } else {
        console.log('Please install MetaMask!');
        showToast("MetaMask Required", "Please install MetaMask to use this app.", "destructive");
      }
    };
  
    init();
  }, []);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:3001/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        showToast("Error", "Failed to fetch leaderboard. Please try again later.", "destructive");
      }
    };
  
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);
  
  const registerTeam = async () => {
    if (!contract) {
      console.log('Contract not initialized.');
      return;
    }
    try {
      const tx = await contract.registerTeam(teamId);
      await tx.wait();
      console.log('Team registered successfully');
      showToast("Success", "Team registered successfully!");
    } catch (error) {
      console.error('Error registering team:', error);
      showToast("Error", "Failed to register team. Please try again.", "destructive");
    }
  };
  
  const payEntryFee = async () => {
    if (!contract) {
      console.log('Contract not initialized.');
      return;
    }
    try {
      const tx = await contract.payEntryFee();
      await tx.wait();
      console.log('Entry fee paid successfully');
      showToast("Success", "Entry fee paid successfully!");
    } catch (error) {
      console.error('Error paying entry fee:', error);
      showToast("Error", "Failed to pay entry fee. Please try again.", "destructive");
    }
  };
  
  const showToast = (title, description, variant = "default") => {
    setToastMessage({ title, description, variant });
    setTimeout(() => setToastMessage(null), 3000); // Hide toast after 3 seconds
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Fantasy Premier League - Blockchain Edition</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Connected Account: {account}</p>
          <Input 
            type="number" 
            value={teamId} 
            onChange={(e) => setTeamId(e.target.value)} 
            placeholder="Enter your FPL Team ID" 
            className="mt-2"
          />
          <Button onClick={registerTeam} className="mt-2 mr-2">Register Team</Button>
          <Button onClick={payEntryFee} className="mt-2">Pay Entry Fee</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {leaderboard.map((team, index) => (
              <li key={index} className="py-2 border-b last:border-b-0">
                Manager: {team.manager.slice(0, 6)}...{team.manager.slice(-4)}, Score: {team.score}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {toastMessage && (
        <Toast
          variant={toastMessage.variant}
          title={toastMessage.title}
          description={toastMessage.description}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;