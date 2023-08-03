const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils.js");
const { type } = require("os");
const fs = require("fs").promises;

function hashMessage(message) {
    return keccak256(utf8ToBytes(JSON.stringify(message)));
}

async function signMessage(message, privateKey) {
    return secp256k1.sign(hashMessage(message), privateKey);
}

function getAddress(publicKey) {
    let kec = keccak256(publicKey.slice(1)).slice(-20);
    return kec;
}

async function recoverKey(message, signature, recoveryBit) {
    return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

function generateWallet() {
    let privateKey = secp256k1.utils.randomPrivateKey();
    let publicKey = secp256k1.getPublicKey(privateKey);
    let address = getAddress(publicKey);
    let balance = Math.floor(Math.random() * 101);
    const userReceive = {
        privateKey: toHex(privateKey),
        publicKey: toHex(publicKey),
        address: "0x" + toHex(address),
        balance,
    };
    const databaseObject = { publicKey: toHex(publicKey), address: "0x" + toHex(address), balance };
    writeObjectToFile("./privateDb.json", userReceive);
    writeObjectToFile("./db.json", databaseObject);
    return userReceive;
}

async function writeObjectToFile(file, obj) {
    try {
        let data;
        try {
            data = await fs.readFile(file);
        } catch (error) {
            console.log(error);
            console.log("Error Reading file");
        }
        let parsed = JSON.parse(data);
        parsed.push(obj);
        await fs.writeFile(file, JSON.stringify(parsed), (err) => console.log(err));
    } catch (error) {
        console.log("Error Write Object to File, Backend");
    }
}

async function getWallets() {
    try {
        let data = await fs.readFile("db.json");
        data = JSON.parse(data);
        return data;
    } catch (error) {
        console.log("Fail Get Wallet Balance, Backend");
    }
}

async function getWalletBalances() {
    let balances = {};
    try {
        let data = await fs.readFile("db.json");
        data = JSON.parse(data);
        for (let i = 0; i < data.length; i++) {
            balances[data[i].address] = data[i].balance;
        }
        return balances;
    } catch (error) {
        console.log("Fail Get Wallet Balance, Backend");
    }
}

async function transferFund(sender, receiver, amount) {
    let senderIndex = -1;
    let receiverIndex = -1;
    try {
        let data = await fs.readFile("db.json");
        data = JSON.parse(data);
        for (let i = 0; i < data.length; i++) {
            if (data[i].address === sender) senderIndex = i;
            if (data[i].address === receiver) receiverIndex = i;
        }

        data[senderIndex].balance -= Number(amount);
        data[receiverIndex].balance += Number(amount);

        await fs.writeFile("db.json", JSON.stringify(data), () => console.log("Fail to write to db.json"));
    } catch (error) {
        console.log("Fail in Transfer Fund, Backend");
    }
}

module.exports = { generateWallet, getWalletBalances, transferFund, getWallets, signMessage };
