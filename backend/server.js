require('dotenv').config();
const axios = require('axios');
const ethers = require('ethers');
const cron = require('node-cron');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const FPL_API_URL = 'https://fantasy.premierleague.com/api/leagues-classic/817877/standings/';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROVIDER_URL = process.env.PROVIDER_URL || "https://rpc.gnosischain.com";

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

async function fetchFPLData() {
    try {
        const response = await axios.get(FPL_API_URL);
        return response.data.standings.results;
    } catch (error) {
        console.error('Error fetching FPL data:', error);
        throw error;
    }
}

async function processTeamScores(fplData) {
    const managers = [];
    const scores = [];

    for (const team of fplData) {
        // Assuming team.entry is the FPL team ID and matches what's stored in the contract
        const contractTeam = await contract.teams(team.entry);
        if (contractTeam.manager !== ethers.ZeroAddress) {
            managers.push(contractTeam.manager);
            scores.push(team.total);
        }
    }

    return { managers, scores };
}

async function updateSmartContract(scores) {
    try {
        const tx = await contract.updateScores(scores.managers, scores.scores);
        await tx.wait();
        console.log('Scores updated on blockchain');
    } catch (error) {
        console.error('Error updating scores on blockchain:', error);
        throw error;
    }
}

async function updateScores() {
    try {
        const fplData = await fetchFPLData();
        const scores = await processTeamScores(fplData);
        await updateSmartContract(scores);
    } catch (error) {
        console.error('Error in updateScores:', error);
    }
}

// Run updateScores every hour
cron.schedule('0 * * * *', updateScores);

// API endpoint to get leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const [managers, scores] = await contract.getLeaderboard();
        const leaderboard = managers.map((manager, index) => ({
            manager,
            score: scores[index].toString()
        }));
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
