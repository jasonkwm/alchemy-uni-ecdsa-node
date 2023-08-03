import { useState } from "react";
import server from "./server";
import { hashMessage, signMessage } from "./utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = {sender: address , receiver:recipient, amount:sendAmount}
    const hashMsg = hashMessage(message);
    const pubKey = secp256k1.getPublicKey(privateKey);
    const signature = await signMessage(message, privateKey);
    const isSigned = secp256k1.verify(signature, hashMsg, pubKey);

    try {
      const promise = await server.post("send", {
        message:message,
        hashMessage:hashMsg,
        privateKey:privateKey
      })
      setBalance(promise.data.balance);
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>
      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          required
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
          required
        ></input>
      </label>

      <label>
        Private Key: 
        <input
          placeholder="Type your private key to sign transaction"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
          required
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" disabled={sendAmount === "" || recipient === "" || privateKey === "" || address === '' ? true : false}/>
    </form>
  );
}

export default Transfer;
