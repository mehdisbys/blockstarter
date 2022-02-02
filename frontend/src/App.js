import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
const axios = require('axios');


const App = () => {


  const [currentAccount, setCurrentAccount] = useState("");
  const [nbWaves, setNbWaves] = useState("");
  const [ethPrice, setEthPrice] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [accountBalance, setAccountBalance] = useState([]);
  const [usdAccountBalance, setUsdAccountBalance] = useState([]);

  const contractAddress = "0xC0Ee3EF5d89320e79f80381eDa20859e06ebC1aA";
  const contractABI = abi.abi;

  const constructor = () => { }

  const handleChange = e => {
    setMessage(e.target.value)
  }


  const getAccountBalance = async () => {
    try {
      const res = await axios({
        method: 'get',
        url: 'https://api-rinkeby.etherscan.io/api?module=account&action=balance&address=0xdda91E3E4300dE7Ab18Bc47c2a491d8AB451Df5B&tag=latest&apikey=Y6S7UXIDUI7GMIB73JSBDC97ENH3YIUAR5',
        data: {
          module: 'account',
          action: 'balance',
          address: '0xdda91E3E4300dE7Ab18Bc47c2a491d8AB451Df5B',
          tag: 'latest',
          apikey: '{API_KEY}'
        }
      });
      var balance = res.data.result / 1000000000000000000
      setAccountBalance(Math.round(balance * 1000) / 1000)

    } catch (error) {
      console.log(error)
    }

  }

  const getEthPrice = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let price = await wavePortalContract.getLatestPrice();
        setEthPrice(price.toNumber() / 100000000)
        console.log("Eth Price: ", ethPrice);

      }
    }
    catch (error) {
      console.log(error)
    }
  }


  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getWaves = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count 2 ...", count.toNumber());
        setNbWaves(count.toNumber())

        let price = await wavePortalContract.getLatestPrice();
        setEthPrice(price.toNumber() / 100000000)

      }
    }
    catch (error) {
      console.log(error)
    }
  }


  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getEthPrice();
    getAccountBalance();
    setUsdAccountBalance(Math.round(ethPrice * accountBalance * 100) / 100)
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there! It seems you are the owner of {accountBalance} ETH !
        </div>

        <form className="bio">
          <label>
            Send me a Message:{" "}
            <input type="text" value={message} onChange={handleChange} />
          </label>
        </form>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <button className="waveButton" onClick={getWaves}>
          Get Waves
          </button>
        <div className="bio">
          There are currently {nbWaves} waves !
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>

      <div className="rightContainer">
        <div className="bio">
          Balance ${usdAccountBalance}
        </div>

        <div className="bio small-font">
          ETH price is {ethPrice} USD !
        </div>
        
      </div>
    </div>
  );
}

export default App