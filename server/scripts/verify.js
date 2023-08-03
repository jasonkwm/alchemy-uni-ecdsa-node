const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { keccak256 } = require("ethereum-cryptography/keccak");

function verifySig(sig, msgHash, publicKey) {
    secp256k1.verify(sig, msgHash, publicKey);
}
