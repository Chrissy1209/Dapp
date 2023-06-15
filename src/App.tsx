import { useCallback, useState } from "react";
import Account from "./components/Account";
import sx from "./App.module.sass";

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [isConnectWallet, setConnectWallet] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");

  const handleConnectWallet = useCallback(() => {
    const connectingWallet = async () => {
      if (typeof window.ethereum === "undefined") {
        window.alert("請先安裝 MetaMask");
      } else {
        try {
          const accounts = await window.ethereum.enable();
          setUserAddress(accounts[0]);
          setConnectWallet(true);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      }
    };
    connectingWallet();
  }, []);

  return (
    <div className={sx.container}>
      <div className={sx.navigationBar}>
        <p className={sx.title}>
          {!isConnectWallet ? "Online Judge w/ Hsu" : "我的錢包"}
        </p>
      </div>
      <div className={!isConnectWallet ? sx.buttonContainer : ""}>
        {!isConnectWallet ? (
          <div className={sx.buttonWrapper}>
            <div onClick={handleConnectWallet} className={sx.connetctButton}>
              Connect MetaMask
            </div>
          </div>
        ) : (
          <Account address={userAddress} />
        )}
      </div>
    </div>
  );
}

export default App;
