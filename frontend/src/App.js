import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/Marketplace.json";
import { Modal } from "./Modal.js";
const axios = require('axios');


const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [nbWaves, setNbWaves] = useState("");
  const [ethPrice, setEthPrice] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [accountBalance, setAccountBalance] = useState([]);
  const [usdAccountBalance, setUsdAccountBalance] = useState([]);
  const [listings, setAllListings] = useState([]);
  const [showModal, setShowModal] = useState(false);



  const contractAddress = "0x8818fCd4F5b4bcC8e9b26CE925881F760a3Ae1C5";
  const contractABI = abi.abi;

  const constructor = () => { }

  const handleChange = e => {
    setMessage(e.target.value)
  }

  const openModal = () => {
    setShowModal(true);
  };

  const createListing = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const waveTxn = await contract.createMarketItem("This is a listing", "Title", 10);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

      }
    }
    catch (error) {
      console.log(error)
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


  const clickCreateListing = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("Got here 1")

        createListing()
        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const allListings = await contract.fetchNumberListings();

        console.log(allListings)

        let listings = [];
        allListings.forEach(l => {
          listings.push({
            address: l.seller,
            deadline: JSON.stringify(new Date(l.deadline * 1000)),
            title: l.title,
            description: l.description,
            targetFundingPrice: parseInt(l.targetFundingPrice._hex)
          });
          console.log(JSON.stringify(l.targetFundingPrice._hex))
          console.log("0x0a")
        });

        setAllListings(listings);

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const contribute = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log(currentAccount)

        const txOverrides = {
          value: ethers.utils.parseEther(message),
          from: currentAccount
        };

        const Txn = await contract.contributeToProject(1, txOverrides);
        console.log("Mining...", Txn.hash);

        await Txn.wait();
        console.log("Mined -- ", Txn.hash);

        let contributors = await contract.fetchContributors();

        console.log(contributors)

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }



  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there! It seems you are the owner of {accountBalance} ETH !
        </div>


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <button className="waveButton" onClick={clickCreateListing}>
          Create New Listing
          </button>

        <button className="waveButton" onClick={contribute}>
          Contribute
          </button>

          <form className="bio">
          <label>
            Contribute to project in ETH :
            <input type="text" value={message} onChange={handleChange}/>
          </label>
        </form>

        <div className="bio">
          There are currently {nbWaves} waves !
        </div>

        <div className="App">
      <h1>Popup Modal</h1>
      <button onClick={openModal}>Open Modal</button>
      {showModal ? <Modal setShowModal={setShowModal} /> : null}
    </div>
        <div id="portal"></div>


        {listings.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.title}</div>
              <div>Address: {wave.description}</div>
              <div>Seller: {wave.address}</div>
              <div>Time: {wave.deadline}</div>
              <div>Message: {wave.message}</div>
              <div>Target: {wave.targetFundingPrice}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App