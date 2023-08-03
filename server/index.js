const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { generateWallet, getWalletBalances, transferFund, getWallets, signMessage } = require("./scripts/generate.js");
const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");

app.use(cors());
app.use(express.json());

let balances = getWalletBalances();
app.get("/balance/:address", async (req, res) => {
    balances = await getWalletBalances();
    const { address } = req.params;
    const balance = balances[address] || 0;
    res.send({ balance });
});

app.post("/send", async (req, res) => {
    const { message, hashMessage, privateKey } = req.body;
    const { sender, receiver, amount } = message;
    const signature = await signMessage(message, privateKey);
    const wallets = await getWallets();
    const senderDb = wallets.filter((wallet) => wallet.address === sender)[0];
    const receiverDb = wallets.filter((wallets) => wallets.address === receiver)[0];

    if (!secp256k1.verify(signature, hashMessage, senderDb.publicKey)) {
        res.status(400).send({ message: "Unauthorize Transaction!" });
        return;
    }
    balances = await getWalletBalances();
    if (balances[sender] < amount) {
        res.status(400).send({ message: "Not enough funds!" });
    } else {
        await transferFund(sender, receiver, amount);
        balances = await getWalletBalances();
        res.send({ balance: balances[sender] });
    }
});

app.get("/generate-wallet", (req, res) => {
    const newWallet = generateWallet();
    res.send(newWallet);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});
