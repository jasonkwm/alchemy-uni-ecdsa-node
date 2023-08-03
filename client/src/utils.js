import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { utf8ToBytes, bytesToHex } from "ethereum-cryptography/utils.js";
export function hashMessage(message) {
    return bytesToHex(keccak256(utf8ToBytes(JSON.stringify(message))));
}

export async function signMessage(message, privateKey) {
    return secp256k1.sign(hashMessage(message), privateKey);
}
