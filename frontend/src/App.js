import React, { useEffect, useState, useRef } from "react";

import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/Marketplace.json";
const axios = require('axios');


const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [listings, setAllListings] = useState([]);
  const [contributedToListings, setContributedToListings] = useState([]);
  const [contributions, setContributions] = useState([])

  const contractAddress = "0x159a65b859fE2b4d4619B97Aa750a48f4F19e32A";
  const contractABI = abi.abi;

  const [state, setState] = useState({
    title: "",
    description: "",
    targetFundingPrice: "",
    contribution: ""
  })

  const handleChange = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmitContribution = function (index, event) {
    var contrib = contributions.slice(); // Make a copy of the emails first.
    contrib[index] = event.target.value; // Update it with the modified email.
    setContributions(contrib); // Update the state.
  }

  const createListing = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const waveTxn = await contract.createMarketItem(state.description, state.title, ethers.utils.parseEther(state.targetFundingPrice));
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

  const getAllListings = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("Got here 1")

        const allListings = await contract.fetchNumberListings();
        const contrib = await contract.fetchContributorsPerProject(2);

        console.log("contributions");

        let listings = [];
        allListings.forEach(async (l) => {
          let contributorsToProject = await contract.fetchContributorsPerProject(parseInt(l.itemId._hex))
          let total = 0;
          let i = 0;

          for (i = 0; i < contributorsToProject.length; i++) {
            total += parseFloat(ethers.utils.formatEther(contributorsToProject[i].contribution));
          }

          let claimedBackFromProject = await contract.fetchClaimedDonationPerProject(parseInt(l.itemId._hex))
          let total_claimed = 0;

          for (i = 0; i < claimedBackFromProject.length; i++) {
            total_claimed += parseFloat(ethers.utils.formatEther(claimedBackFromProject[i].contribution));
          }

          listings.push({
            address: l.seller,
            deadline: JSON.stringify(new Date(l.deadline * 1000)),
            title: l.title,
            description: l.description,
            targetFundingPrice: ethers.utils.formatEther(l.targetFundingPrice),
            id: parseInt(l.itemId._hex),
            contributors: contributorsToProject,
            total: total - total_claimed,
            completed: (total - total_claimed / ethers.utils.formatEther(l.targetFundingPrice)).toPrecision(2) * 100
          });
        });

        setAllListings(listings);

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllProjectsContributedTo = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        await checkIfWalletIsConnected();

        console.log("Got getAllProjectsContributedTo")

        console.log("Current Account " + currentAccount)

        const allListings = await contract.fetchcontributorToProjects("0xdda91E3E4300dE7Ab18Bc47c2a491d8AB451Df5B");

        console.log("contributed to projects");
        console.log(allListings);

        let listings = [];
        allListings.forEach(async (l) => {
          let project = await contract.fetchProject(parseInt(l._hex));
          console.log("project");
          console.log(project);

          let contributorsToProject = await contract.fetchContributorsPerProject(parseInt(l._hex))
          let total = 0;
          let i = 0;

          for (i = 0; i < contributorsToProject.length; i++) {
            if(contributorsToProject[i].sender==="0xdda91E3E4300dE7Ab18Bc47c2a491d8AB451Df5B"){
            total += parseFloat(ethers.utils.formatEther(contributorsToProject[i].contribution));
          }
          }

          listings.push({
            address: project.seller,
            deadline: JSON.stringify(new Date(project.deadline * 1000)),
            title: project.title,
            description: project.description,
            targetFundingPrice: ethers.utils.formatEther(project.targetFundingPrice),
            id: parseInt(project.itemId._hex),
            contribution: total,
          });
        });

        setContributedToListings(listings);

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const clickCreateListing = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {

        createListing()

        getAllListings()


      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target.projectId);
    contribute(e.target.index.value, e.target.projectId.value);
  };

  const handleClaim = (e) => {
    e.preventDefault();
    console.log(e.target.projectId);
    claimBackDonationMissedProjectDeadline(e.target.projectId.value);
  };


  const contribute = async (index, projectId) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("In contribute() 1")
        console.log(contributions)
        console.log(index)

        const txOverrides = {
          value: ethers.utils.parseEther(contributions[index]),
          from: currentAccount
        };
        console.log(ethers.utils.parseEther(contributions[index]))
        console.log("In contribute() 2")
        console.log("ProjectId" + projectId)
        console.log("Index" + index)

        const Txn = await contract.contributeToProject(projectId, txOverrides);
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

  const claimBackDonationMissedProjectDeadline = async (projectId) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("In claim() 1")

        const Txn = await contract.claimBackDonationMissedProjectDeadline(projectId);
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
    getAllListings();
    getAllProjectsContributedTo();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there! Welcome to BlockStarter !
        </div>


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className="bio">
          There are currently {listings.length} projects !
        </div>

        <div className="App">
          <h3>Create New Listing</h3>
        </div>
        <div id="bio">

          <form id="form">
            <label>
              <div>Title</div>
              <input
                type="text"
                name="title"
                value={state.title}
                onChange={handleChange}
              />
            </label>
            <p></p>
            <label>
              <div>Description</div>
              <textarea
                type="text"
                name="description"
                value={state.description}
                onChange={handleChange}
              />
            </label>
            <p></p>
            <label>
              <div>Target Funding</div>
              <input
                type="text"
                name="targetFundingPrice"
                value={state.targetFundingPrice}
                onChange={handleChange}
              />
            </label>
            <p></p>
          </form>
        </div>
        <div>
          <button className="waveButton" onClick={clickCreateListing}>Submit</button>
        </div>

        {listings.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Id#: {wave.id}</div>
              <div>Title: {wave.title}</div>
              <div>Address: {wave.description}</div>
              <div>Seller: {wave.address}</div>
              <div>Time: {wave.deadline}</div>
              <div>Target: {wave.targetFundingPrice}</div>
              <div>Contributors: {wave.contributors.length}</div>
              <div>Total Funded: {wave.total}</div>
              <div>%: {wave.completed}</div>
              <form className="bio" onSubmit={handleSubmit}>
                <label>
                  Contribute to project in ETH :
            <input key={wave.id} id={wave.id} name="contribution" type="text" value={contributions[index]} onChange={handleSubmitContribution.bind(this, index)} />
                </label>
                <input readOnly hidden name="index" type="text" value={index} />
                <input readOnly hidden name="projectId" type="text" value={wave.id} />
                <button type="submit">Submit</button>
              </form>
              <form onSubmit={handleClaim}>
                <label>
                  Claim back donation: {wave.total}</label>
                <input readOnly hidden name="projectId" type="text" value={wave.id} />

                <button type="submit">Claim</button>
              </form>
            </div>)
        })}


        <h4>Projects contributed to: </h4>

        {contributedToListings.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Id#: {wave.id}</div>
              <div>Title: {wave.title}</div>
              <div>Address: {wave.description}</div>
              <div>Seller: {wave.address}</div>
              <div>Time: {wave.deadline}</div>
              <div>Target: {wave.targetFundingPrice}</div>
              <div>My Contribution: {wave.contribution}</div>
              <form className="bio" onSubmit={handleSubmit}>
                <label>
                  Contribute to project in ETH :
            <input key={wave.id} id={wave.id} name="contribution" type="text" value={contributions[index]} onChange={handleSubmitContribution.bind(this, index)} />
                </label>
                <input readOnly hidden name="index" type="text" value={index} />
                <input readOnly hidden name="projectId" type="text" value={wave.id} />
                <button type="submit">Submit</button>
              </form>
              <form onSubmit={handleClaim}>
                <label>
                  Claim back donation: {wave.total}</label>
                <input readOnly hidden name="projectId" type="text" value={wave.id} />

                <button type="submit">Claim</button>
              </form>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App