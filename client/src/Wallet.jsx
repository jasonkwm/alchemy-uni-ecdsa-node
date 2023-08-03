import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, newWallet, setNewWallet }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data
      } = await server.get(`balance/${address}`);
      setBalance(data.balance);
    } else {
      setBalance(0);
    }
  }

  async function getNewWallet() {
    try {
      const response = await server.get(`generate-wallet`);
      setNewWallet(response.data);
      setAddress(response.data.address);
      setBalance(response.data.balance);
    } catch (error) {
      console.log("Get New Wallet Error, Backend");
    }
  }
  
  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>
      <div className="balance">Balance: {balance}</div>
      <div>
        <h2>Generate Wallet</h2>
        <p>Private Key: {newWallet.privateKey}</p>
        <p>Public Key: {newWallet.publicKey}</p>
        <p>Address: {newWallet.address}</p>
        <button onClick={getNewWallet}>Generate</button>
      </div>
    </div>
  );
}

export default Wallet;
