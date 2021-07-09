import Head from "next/head";
import Image from "next/image";
import { useEffect, StyleSheet, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { ProgressBar } from "react-progressbar-fancy";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Contract, ethers, providers } from "ethers";
import NumericLabel from "react-pretty-numbers";
import { address, abi } from "../contract";
import mitt from "next/dist/next-server/lib/mitt";
import swal from '@sweetalert/with-react'
import Image from 'next/image'
var ls = require("local-storage");

const Home = () => {
  const [web3Modal, setweb3modal] = useState(null);
  const [provider, setProvider] = useState(null);
  const [web3providerState, setweb3provider] = useState(null);
  const [mainProvider, setMainProvider] = useState(null);

  const [disabledConnectButtonVisible, setdisabledConnect] = useState(false);
  const [walletLoaded, setWalletLoaded] = useState(false);

  const [web3, setWeb3] = useState(null);
  const [provider2, setProvider2] = useState(null);
  const [selectedAccount2, setSelectedAccount2] = useState(null);

  const [timeLeft, setTimeLeft] = useState(null);
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [countdownunix, setcountdownunix] = useState(null);
  const [countdownunixwhitelist, setcountdownunixwhitelist] = useState(null);
  const [countdownunixend, setcountdownunixend] = useState(null);
  const [initiated, setinitiated] = useState(false);
  const [currentStage, setCurrentStage] = useState(false);
  const [walletStats, setWalletStats] = useState(false);
  const [totalRaised, setTotalRaised] = useState(null);
  const [totalPurchased, setTotalPurchased] = useState(null);
  const [price, setPrice] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const [countDownTimerWhitelist, setCountDownTimerWhitelist] = useState({
    min: 0,
    sec: 0,
    hours: 0,
    days: 0,
  });
  const [countDownTimer, setCountDownTimer] = useState({
    min: 0,
    sec: 0,
    hours: 0,
    days: 0,
  });
  const [countDownTimerEnd, setCountDownTimerEnd] = useState({
    min: 0,
    sec: 0,
    hours: 0,
    days: 0,
  });
  const [remainingTokens, setRemainingTokens] = useState(null);
  const [presaleDetails, setPresaleDetails] = useState({
    minCap: null,
    maxCap: null,
    minBuy: null,
    maxBuy: null,
    startDate: null,
    endDate: null,
    tokensSold: null,
    percentageRaised: 0,
    status: "LOADING...",
  });
  const numbericoption = {
    commafy: true,
    shortFormat: false,
    shortFormatMinValue: 100000,
    shortFormatPrecision: 1,
  };
  const styles = {
    main: {
      backgroundColor: "Red",
    },
  };

  // const mainWeb3Provider = new Web3.providers.HttpProvider(
  //   "http://data-seed-pre-0-s1.binance.org:80",
  //   {}
  // );
  const mainWeb3Provider = new ethers.providers.Web3Provider(
    new Web3.providers.HttpProvider(
      "https://data-seed-prebsc-1-s1.binance.org:8545/"
    )
  );
  const PresaleBuyButton = () => {
    if (currentStage === false) {
      return <div className="loading">Loading...</div>;
    } else if (currentStage === "WHITELISTED") {

    } else if (currentStage === "LIVE") {

    }
  };

  const getSelectedWalletDetailsPresale = async (walletAddress) => { };
  const connectWalletconnect = async () => {
    console.log("connecting wallet connect")
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        display: { name: "Trust Wallet/MetaMask/Mobile" },
        options: {
          rpc: { 56: "https://bsc-dataseed1.ninicoin.io" },
          network: "binance",
          infuraId: "infura key",
        },
      },
    };

    let web3Modal = new Web3Modal({
      cacheProvider: false, // optional
      providerOptions, // required
      disableInjectedProvider: false, //optional. For MetaMask/Brave/Opera.
    });
    let provider = await web3Modal.connect();
    setMainProvider(provider);
    let web3Provider = new providers.Web3Provider(provider);
    setWalletLoaded(provider.accounts[0]);
    setdisabledConnect(true); //disable button
    setweb3modal(web3Provider);

    handleProvider(web3Provider, provider.accounts[0]);
    let isDisconnectedWalletConnect = false;
    let loginTimeout = setInterval(() => {
      // console.log("Logouttimer started");
      // console.log(ls('walletconnect'));
      if (ls('walletconnect') === null) {
        if (isDisconnectedWalletConnect === false) {
          isDisconnectedWalletConnect = true;
          ls('disconnected', true);
          // console.log("logout timer ended");
          setdisabledConnect(false);
          clearInterval(loginTimeout);
        }
      }
    }, 1000)
  }


  const signIn = async () => {
    if (window.ethereum) {
      window.ethereum.enable().then(() => {
        console.log(window.ethereum, " EHTEREUM ");
        let provider = window.ethereum;
        console.log("originalprovider", provider);
        setMainProvider(provider);
        let web3Provider = new providers.Web3Provider(provider);
        console.log("setting wallet", window.ethereum.selectedAddress)
        setWalletLoaded(window.ethereum.selectedAddress);

        setdisabledConnect(true); //disable button
        setweb3modal(web3Provider);
        handleProvider(web3Provider, window.ethereum.selectedAddress);
      }).catch((err) => {
      })
    } else {
      if (ls('disconnected') === true) {
        connectWalletconnect();
      } else {
        if (ls('walletconnect') !== undefined) {
          connectWalletconnect();
        }
      }
      // connectWalletconnect();
      // Tell Web3modal what providers we have available.
      // Built-in web browser provider (only one can exist at a time)
      // like MetaMask, Brave or Opera is added automatically by Web3modal

    }
  }
  useEffect(async () => {
    let disconnected = ls('disconnected');
    console.log(disconnected);
    if (disconnected === false) {
      signIn();
    } else {
      //not signed in yet.
    }
  }, []);

  useEffect(async () => {
    console.log("WALLET LOADED EFFECT", walletLoaded);
    if (walletLoaded !== false) {
      console.log("Starting wallet loaded effect listening!");
      setIsListening(true);
      let web3 = await new Web3(new Web3.providers.WebsocketProvider(
        "wss://data-seed-prebsc-1-s1.binance.org:8545", {
        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 5,
          onTimeout: false,
        },
      }))
      const contract = await new web3.eth.Contract(abi, address);
      console.log(web3, contract);
      let blockNumber = await web3.eth.getBlockNumber();
      console.log("Contract bitch", contract);
      contract.events.presalePurchase({
        fromBlock: blockNumber
      }, function (error, event) {
        console.log("EVENT HAPPENED!", event)
      })
        .on('data', async function (event) {
          console.log("Someone bouht!", event); // same results as the optional callback above
          let oldTotalRaised = totalRaised;
          console.log("Oldtotalraised", oldTotalRaised);
          let newTotalRaised = Number(oldTotalRaised) + Number(event.returnValues.bnbPaid);
          console.log("Newtotalraised: ", newTotalRaised);
          setTotalRaised(newTotalRaised);
          updatePresaledetails();

          // console.log("Wallet loaded before", prevState);
          let remainingTokens = await contract.methods.getPresaleDetailsP2().call();
          console.log("remaining tokens", remainingTokens);
          setRemainingTokens(remainingTokens);

          console.log("Wallet event", event.returnValues.wallet);
          if (event.returnValues.wallet.toLowerCase() == walletLoaded.toLowerCase()) {

            swal("✅ Token Purchase Successful", "You have Purchased: " + (Number(event.returnValues.tokensBought) / 1000000000) + " $HDLR Tokens!\n\nYou will be able to claim your tokens on this webpage, once the presale is Finalized by the contract owner.\n\nThis should happen maximum 3 days after the presale has reached hard cap or has ended(Time ran out).\nIf the presale is not Finalized by that time, the presale will get cancelled automatically, and you will be able to claim you'r BNB's back on this page.\n\nIf you have any questions, contact us on our telegram https://t.me/hodlerocom");
            setTotalPurchased(prevState => {
              let newTotal = Number(prevState) + Number(event.returnValues.tokensBought)
              let number = Number(newTotal);
              console.log("New total purchase");
              return number;
            })
          }
        })
        .on('changed', function (event) {
          // remove event from local database
        })
        .on('error', console.error);




      contract.events.presaleCompleteMinCap({
        fromBlock: blockNumber
      }, function (error, event) {
        console.log("EVENT HAPPENED!", event)
      })
        .on('data', async function (event) {
          console.log("Presale comlpete event", event);
          swal("✅ Soft cap hit!", "We have reached a milestone HODLERS!\n We have raised We can now consider ourselfes a success!\nWe are now truely on the way to the moon, the team will now get unlocked 60BNB to market with from the initial soft cap hit.");
        })
        .on('changed', function (event) {
          // remove event from local database
        })
        .on('error', console.error);

      contract.events.presaleCompleteMaxCap({
        fromBlock: blockNumber
      }, function (error, event) {
        console.log("EVENT HAPPENED!", event)
      })
        .on('data', async function (event) {
          console.log(event);
          swal("✅ Hard cap hit!", "We have reached hard cap fellas!");
        })
        .on('changed', function (event) {
          // remove event from local database
        })
        .on('error', console.error);

    }
  }, [walletLoaded !== undefined && walletLoaded !== false && remainingTokens !== null])
  const listenToEmits = async () => {

  }
  const handleProvider = async (provider, selectedWallet) => {

    console.log("Handling provider, ", provider);
    // setWeb3(new Web3(provider));
    // let web3Provider = new providers.Web3Provider(provider);
    setweb3provider(provider);




    getPresaleDetails();
    refreshMyDetails(selectedWallet);
    console.log("handliong proivider", provider);
    ls('disconnected', false);
    console.log("initiating accounts changed function")


    if (provider.connection.url === 'metamask') {
      provider.provider.on("accountsChanged", (accounts) => {
        console.log("Accs changed ")
        console.log(accounts);
        if (accounts.length === 0) {
          setdisabledConnect(false); //
          // ls("connectedWeb3", false);
        } else {
          setWalletLoaded(false);
          setWalletLoaded(accounts[0]);
          refreshMyDetails(accounts[0]);
        }
      });
      // Subscribe to chainId change
      provider.provider.on("chainChanged", (chainId) => {
        console.log(chainId);
      });
      // Subscribe to session disconnection
      provider.provider.on("connection", (code, reason) => {
        console.log(code, reason);
      });
      provider.provider.on("disconnect", (code, reason) => {
        console.log("Someone disconnected");
        ls("connectedWeb3", false);
        setWalletLoaded(null);
        setdisabledConnect(true);
        console.log(code, reason);
      });
    }
    // listenToEmits();
  };

  const countDown = async (startDate, endDate, whitelistedEndDate) => {
    //  await updatePresaledetails();
    console.log("Countdown 1 started");
    console.log(startDate);
    let _startDate = new Date(startDate).getTime();
    var interval = setInterval(async function () {
      var now = new Date().getTime();
      var timeleft = _startDate - now;
      // console.log(_startDate, now)
      // console.log(timeleft);
      var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
      console.log(days + ":" + hours + ":" + minutes + ":" + seconds);

      if (timeleft < 0) {
        console.log("Countdown 1 ended");
        clearInterval(interval);
        countDownWhitelist(whitelistedEndDate, endDate);
        setTimeout(async () => {
          await updatePresaledetails();
        }, 5000);
      } else {
        setcountdownunixwhitelist(timeleft);
        setcountdownunix(timeleft);
        setCountDownTimerWhitelist({
          min: minutes,
          sec: seconds,
          hours: hours,
          days: days,
        });
      }
    }, 1000);
  };
  const countDownWhitelist = async (whitelistEndDate, endDate) => {
    console.log("Countdown whitelist started");
    var interval3 = setInterval(async function () {
      var now = new Date().getTime();
      var timeleft = whitelistEndDate - now;
      var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
      console.log(days + ":" + hours + ":" + minutes + ":" + seconds);

      if (timeleft < 0) {
        clearInterval(interval3);
        countdownEnd(endDate);
        // await
        setTimeout(async () => {
          await updatePresaledetails();
        }, 5000);
      } else {
        setcountdownunixwhitelist(timeleft);
        setcountdownunix(timeleft);
        setCountDownTimerWhitelist({
          min: minutes,
          sec: seconds,
          hours: hours,
          days: days,
        });
      }
    }, 1000);
  };
  const refreshMyDetails = async (addy) => {
    console.log("refreshing details");
    const HODLER = await new ethers.Contract(address, abi, mainWeb3Provider);
    console.log("Updating data:", addy);
    let addy2 = await HODLER.getPresaleWallet(addy);

    let whitelisted = addy2.whitelisted;
    let refunded = addy2.refunded;
    let claimed = addy2.claimed;
    let amountRefunded = parseInt(addy2.amountRefunded);
    let amountClaimed = parseInt(addy2.amountClaimed);
    let amountBNBPaid = parseInt(addy2.amountBNBPaid);
    let amountTokensBought = parseInt(addy2.amountTokensBought);
    let addys = {
      amountRefunded,
      amountClaimed,
      amountBNBPaid,
      whitelisted,
      refunded,
      claimed,
    };
    setTotalPurchased(amountTokensBought)
    setWalletStats(addys);
  };
  const countdownEnd = async (endDate) => {
    await updatePresaledetails();
    let _startDate = new Date().getTime();
    let _endDate = new Date(endDate).getTime();
    console.log(_endDate, _startDate);
    console.log("Countdown end started");
    var interval2 = setInterval(async function () {
      var now = new Date().getTime();
      var timeleft = endDate - now;
      var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
      console.log(days + ":" + hours + ":" + minutes + ":" + seconds);

      if (timeleft < 0) {
        clearInterval(interval2);
        setTimeout(async () => {
          await updatePresaledetails();
        }, 5000);

        // await getPresaleDetails();
      } else {
        setcountdownunixend(timeleft);
        setCountDownTimerWhitelist({
          min: minutes,
          sec: seconds,
          hours: hours,
          days: days,
        });
      }
    }, 1000);
  };
  const updatePresaledetails = async () => {
    return new Promise(async (resolve, reject) => {
      console.log("updating presale details");
      // const provider = new ethers.providers.Web3Provider(provider);
      const HODLER = new ethers.Contract(address, abi, mainWeb3Provider);

      let details = await HODLER.getPresaleDetails();
      let detailsp2 = await HODLER.getPresaleDetailsP2();
      let status = await HODLER.getPresaleStateText();
      console.log(details);
      console.log(status);
      console.log("SP2", parseInt(detailsp2));
      let totalTokensRemaining = parseInt(detailsp2);
      console.log("total sold: ", totalTokensRemaining);
      setRemainingTokens(totalTokensRemaining);
      let minCap = parseInt(details._minCap);
      let maxCap = parseInt(details._maxCap);
      let minBuy = parseInt(details._minBuy);
      let maxBuy = parseInt(details._maxBuy);
      let totalRaised = parseInt(details._raisedBNB);
      let _startDate = parseInt(details._startDate);
      let _endDate = parseInt(details._endDate);
      let _whitelistedEnd = parseInt(details._whitelistedEndDate);
      let tokensSold = parseInt(details._tokensSOLD);
      let percentageRaised = (totalRaised / maxCap);
      console.log("Percentage raised: ", percentageRaised)
      console.log("Maxcap: ", maxCap);
      console.log("Mincap: ", minCap);
      let startDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
      let endDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
      let whitelistedEndDate = new Date(0);
      startDate.setUTCSeconds(_startDate);
      endDate.setUTCSeconds(_endDate);
      whitelistedEndDate.setUTCSeconds(_whitelistedEnd);
      console.log(whitelistedEndDate);
      console.log(startDate, whitelistedEndDate);
      // countDownWhitelist(startDate, whitelistedEndDate);
      // countdownEnd(startDate, endDate);
      setTotalRaised(Number(totalRaised / 10000000000000000));
      setPresaleDetails({
        minCap: minCap / 10000000000000000,
        maxCap: maxCap / 10000000000000000,
        minBuy: minBuy / 10000000000000000,
        maxBuy: maxBuy / 10000000000000000,
        startDate,
        endDate,
        tokensSold: tokensSold / 100000000,
        percentageRaised,
        status,
      });
      resolve();
    });
  };
  const getPresaleDetails = async () => {
    return new Promise(async (resolve, reject) => {
      console.log("getting presale details");
      // const provider = new ethers.providers.Web3Provider(provider);
      const HODLER = new ethers.Contract(address, abi, mainWeb3Provider);
      console.log(HODLER);

      let details = await HODLER.getPresaleDetails();
      let status = await HODLER.getPresaleStateText();
      console.log(details);
      console.log(status);
      let detailsp2 = await HODLER.getPresaleDetailsP2();
      console.log("SP2", parseInt(detailsp2));
      let totalTokensSold = parseInt(detailsp2);
      setRemainingTokens(totalTokensSold);
      let minCap = parseInt(details._minCap);
      let maxCap = parseInt(details._maxCap);
      let minBuy = parseInt(details._minBuy);
      let maxBuy = parseInt(details._maxBuy);
      let totalRaised = parseInt(details._raisedBNB);
      let _startDate = parseInt(details._startDate);
      let _endDate = parseInt(details._endDate);
      let _whitelistedEnd = parseInt(details._whitelistedEndDate);
      let tokensSold = parseInt(details._tokensSOLD);
      let percentageRaised = (totalRaised / maxCap);

      console.log("Percentage raised: ", percentageRaised)
      console.log("Total raised:" + totalRaised);
      console.log("Maxcap: ", maxCap);
      console.log("Mincap: ", minCap);
      let startDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
      let endDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
      let whitelistedEndDate = new Date(0);


      startDate.setUTCSeconds(_startDate);
      endDate.setUTCSeconds(_endDate);
      whitelistedEndDate.setUTCSeconds(_whitelistedEnd);
      console.log(whitelistedEndDate);
      console.log(startDate, whitelistedEndDate);
      countDown(startDate, endDate, whitelistedEndDate);
      // countDownWhitelist(startDate, whitelistedEndDate);
      // countdownEnd(startDate, endDate);

      setPresaleDetails({
        minCap: minCap / 10000000000000000,
        maxCap: maxCap / 10000000000000000,
        minBuy: minBuy / 10000000000000000,
        maxBuy: maxBuy / 10000000000000000,
        totalRaised: totalRaised / 10000000000000000,
        startDate,
        endDate,
        tokensSold: tokensSold / 100000000,
        percentageRaised,
        status,
      });
      resolve();
    });
  };

  const onClick = async () => {
    if (ls('disconnected') === true) {
      signIn();
    } else {
      //already signed in.
    }
  };
  const claimBNB = async () => {
    let web3 = await new Web3(mainProvider);
    var gasPrice = await web3.eth.getGasPrice();//or get with web3.eth.gasPrice
    var gasLimit = 3000000;
    const contract = await new web3.eth.Contract(abi, address);
    console.log(gasPrice);
    console.log(gasLimit);
    console.log(price);
    console.log(contract);
    const transactionObject = {
      from: walletLoaded,
      gas: gasLimit,
      gasPrice: gasPrice,
    };
    console.log(transactionObject);
    contract.methods.claimRefunds().send(transactionObject).then((resp) => {
      if (resp.status === true) {
        console.log("we claimed refunds");
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  const claimTokens = async () => {
    let web3 = await new Web3(mainProvider);
    var gasPrice = await web3.eth.getGasPrice();//or get with web3.eth.gasPrice
    var gasLimit = 3000000;
    const contract = await new web3.eth.Contract(abi, address);
    console.log(gasPrice);
    console.log(gasLimit);
    console.log(price);
    console.log(contract);
    const transactionObject = {
      from: walletLoaded,
      gas: gasLimit,
      gasPrice: gasPrice,
    };
    console.log(transactionObject);
    contract.methods.claimTokens().send(transactionObject).then((resp) => {
      if (resp.status === true) {
        console.log("we claimed refunds");
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  const closeModal = async () => {
    console.log(provider);
    if (typeof web3Modal !== "function") {
      // safe to use the function
      if (web3Modal !== null) {
        console.log(web3Modal);
        // console.log(web3Modal.clearCacheProvider())
        // if (web3Modal.clearCachedProvider() !== undefined) {
        // await web3Modal.clearCachedProvider();  
        // }

        ls("disconnected", true);
        // ls("connectedWeb3", false);
        setProvider(null);
        setdisabledConnect(false);
      }
    }
    // await web3Modal.disconnect();
  };
  const onChangeBuyAmount = (e) => {
    let value = e.target.value;
    let available = remainingTokens / 1000000000;

    if (available >= value) {
      setAmountToBuy(value);
      console.log(1000000000 / remainingTokens);
      let price = (1000000000 / 60000000000000) * value;
      setPrice(price.toFixed(9));
    } else {
      setAmountToBuy(remainingTokens / 1000000000);
      setPrice(
        (
          (1000000000 / 60000000000000) *
          (remainingTokens / 1000000000)
        ).toFixed(9)
      );
    }
  };
  const getStatusColor = () => {
    let status = presaleDetails.status;
    let style = {};
    if (status === "CANCELLED") {
      style.color = "WHITE";
      style.backgroundColor = "#e56051";
    } else if (status === "WHITELISTED") {
      style.color = "WHITE";
      style.backgroundColor = "#0ed2f7";
    } else if (status === "LIVE") {
      style.color = "WHITE";
      style.backgroundColor = "#3eba2d";
    } else if (status === "ENDED") {
      style.color = "WHITE";
      style.backgroundColor = "#0575e6";
    } else if (status === "FINALIZED") {
      style.color = "WHITE";
      style.backgroundColor = "#7303c0";
    }
    return style;
  };
  const purchaseTokens = async () => {
    let web3 = await new Web3(mainProvider);
    var gasPrice = await web3.eth.getGasPrice();//or get with web3.eth.gasPrice
    var gasLimit = 3000000;
    const contract = await new web3.eth.Contract(abi, address);
    console.log(gasPrice);
    console.log(gasLimit);
    console.log(price);
    console.log(contract);
    const transactionObject = {
      from: walletLoaded,
      gas: gasLimit,
      gasPrice: gasPrice,
      value: price * 1000000000000000000
    };
    console.log(transactionObject);
    contract.methods.buyTokensForBnb().send(transactionObject).then((resp) => {
      if (resp.status === true) {
        console.log("we purchased tokens")
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='background'></div>
      <div className="statusBar" style={getStatusColor()}>
        {presaleDetails.status}
      </div>
      <div className="header-logo-holder">
        <Image className="logo" src="/img/large.png" alt="Hodlero logo" />
      </div>
      <div className="logo-text">HODLERO</div>
      <div className="logo-text-presale">PRESALE</div>
      <div className="logo-text-description">
        <div className='description-blue'></div>
        <div id="presale-holder">
          <div id="price-holder">
            <div className="price-item">1 BNB</div>
            {/* <div className="divider">=</div> */}
            <div className="price-item">60,000 HDLR</div>
          </div>
        </div>
        {disabledConnectButtonVisible === false ? (
          <div id="connect-wallet-button-middle" onClick={() => onClick()}>
            CONNECT WALLET TO SEE PRESALE
          </div>
        ) : (
          ""
        )}
        {(countdownunix !== null && countdownunix > 0) ||
          (countdownunixwhitelist !== null && countdownunixwhitelist > 0) ||
          presaleDetails.status === "NOT_YET_BUYABLE" ||
          presaleDetails.status === "WHITELISTED" ||
          presaleDetails.status === "FINALIZED" ||
          presaleDetails.status === "ENDED" ||
          presaleDetails.status === "CANCELLED" ||
          presaleDetails.status === "LIVE" ||
          (countdownunixend !== null && countdownunixend > 0) ? (
          <>
            {presaleDetails.status === "NOT_YET_BUYABLE" ? (
              <>
                <div className="title">WHITELISTED PRESALE STARTS IN</div>
                <div className="timeLeft">
                  {countDownTimerWhitelist.days +
                    ":" +
                    countDownTimerWhitelist.hours +
                    ":" +
                    countDownTimerWhitelist.min +
                    ":" +
                    countDownTimerWhitelist.sec}
                </div>
              </>
            ) : presaleDetails.status === "WHITELISTED" ? (
              <>
                <div className="title">LIVE PRESALE STARTS IN</div>
                <div className="timeLeft">
                  {countDownTimerWhitelist.days +
                    ":" +
                    countDownTimerWhitelist.hours +
                    ":" +
                    countDownTimerWhitelist.min +
                    ":" +
                    countDownTimerWhitelist.sec}
                </div>
                <ProgressBar
                  laber="something"
                  score={presaleDetails.percentageRaised}
                  progressColor={"purple"}
                />

                {walletStats.whitelisted === true ? (
                  <div
                    className="whitelistButton"
                    onClick={() => purchaseTokens()}
                  >
                    PURCHASE NOW
                  </div>
                ) : (
                  <div className="redWarning">
                    This wallet is not eligible for the whitelisted presale,
                    please wait until it runs out!
                  </div>
                )}
              </>
            ) : presaleDetails.status === "LIVE" ? (
              <>
                <div className="title">LIVE PRESALE ENDS IN</div>
                <div className="timeLeft">
                  {countDownTimerWhitelist.days +
                    ":" +
                    countDownTimerWhitelist.hours +
                    ":" +
                    countDownTimerWhitelist.min +
                    ":" +
                    countDownTimerWhitelist.sec}
                </div>
                <ProgressBar
                  laber="something"
                  score={presaleDetails.percentageRaised}
                  progressColor={"purple"}
                />
                <div
                  className="whitelistButton"
                  onClick={() => purchaseTokens()}
                >
                  PURCHASE NOW
                </div>
              </>
            ) : presaleDetails.status === "CANCELLED" ? (
              <>
                <div className="title">THE PRESALE HAS BEEN CANCELLED!</div>
                <div className="buttonGreen" onClick={() => claimBNB()}>CLAIM REFUNDS!</div>
              </>
            ) : presaleDetails.status === "FINALIZED" ? (
              <>
                <div className="title">THE PRESALE HAS BEEN FINALIZED!</div>
                <div className="buttonGreen" onClick={() => claimTokens()}>CLAIM {totalPurchased / 1000000000} #HDLR</div>
              </>
            ) : (
              presaleDetails.status === "ENDED" ? <>
                <div className="title-ended">✅ THE PRESALE HAS BEEN ENDED!</div>
                <div className='title-ended-desc'>The presale has ended, and within the next 24 hours, the contract owner will Finalize the contract, and you will be able to claim your tokens automatically through this website.</div>
              </> : <></>
            )}
          </>
        ) : (
          ""
        )}

        <div className="availablepurchased-tokens">
          <div className="text-holder">
            <div className="text-holder-top-text">HDLR AVAILABLE</div>
            {/* <span className='smallName'>{remainingTokens / 1000000000}</span> */}
            <div className="text-holder-bottom-value">
              <NumericLabel params={numbericoption}>
                {remainingTokens / 1000000000}
              </NumericLabel>
            </div>
          </div>
          <div className="text-holder">
            <div className="text-holder-top-text">PURCHASED</div>
            <div className="text-holder-bottom-value">
              {totalPurchased / 1000000000} HDLR
            </div>
          </div>
        </div>
        <div className="availablepurchased-tokens">
          <div className="text-holder">
            <div className="text-holder-top-text">AMOUNT TO BUY</div>
            <input
              className="text-holder-bottom-input"
              type="number"
              value={amountToBuy}
              onChange={(e) => onChangeBuyAmount(e)}
            ></input>
          </div>
          <div className="text-holder">
            <div className="text-holder-top-text">PRICE (BNB)</div>
            <input
              className="text-holder-bottom-input"
              type="number"
              disabled
              defaultValue={price}
            ></input>
          </div>
        </div>
      </div>


      {disabledConnectButtonVisible === false ? (
        <div id="connect-wallet-button" onClick={() => onClick()}>
          CONNECT WALLET
        </div>
      ) : (
        <>
          <div id="connect-wallet-button" onClick={() => closeModal()}>
            DISCONNECT WALLET
          </div>
          <div className="selected-address">
            <div>SELECTED WALLET</div>
            <div className="selected-addy">{walletLoaded}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
