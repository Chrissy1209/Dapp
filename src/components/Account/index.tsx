import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { TbCopy } from "react-icons/tb";
import { FaEthereum } from "react-icons/fa";
import { MdDownload, MdOutlineSwapHoriz } from "react-icons/md";
import { FiArrowUpRight } from "react-icons/fi";

import FindAddress from "../FindAddress";
import sx from "./Account.module.sass";

// const ACCESS_API = process.env.REACT_APP_ACCESS_API || "";
// const address = process.env.REACT_APP_ADDRESS || "";

type AccountProps = {
  address: string;
};
const Account = ({ address }: AccountProps) => {
  const addressSliceOne = address.substring(0, 5);
  const addressSliceTwo = address.substring(38, 42);
  const [balance, setBalance] = useState(0);
  const [defaultNonce, setDefaultNonce] = useState(0);

  const [currentPage, setCurrentPage] = useState("account");
  const [fetchDefaultDataToggle, setFetchDefaultDataToggle] = useState(false);

  const handleAddressCopy = useCallback(() => {
    navigator.clipboard.writeText(address).catch((error) => {
      console.error("Error copying text to clipboard:", error);
    });
  }, [address]);

  const handlePageChange = useCallback(() => {
    setCurrentPage("send");
  }, [setCurrentPage]);

  useEffect(() => {
    const getDefaultData = async () => {
      try {
        // const provider = new ethers.providers.JsonRpcProvider(
        //   `https://linea-goerli.infura.io/v3/${ACCESS_API}`
        // );
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const getBalance = await provider.getBalance(address);
        const formatBalance = Number(ethers.utils.formatEther(getBalance));
        if (formatBalance < 1) setBalance(Number(formatBalance.toFixed(9)));
        else setBalance(formatBalance);
        const getTransactionCount = await provider.getTransactionCount(address);
        setDefaultNonce(getTransactionCount);
      } catch (err) {
        console.log(err);
      }
    };
    getDefaultData();
  }, [address, fetchDefaultDataToggle]);

  return (
    <div className={sx.container}>
      {currentPage === "account" && (
        <>
          <div className={sx.accountInfoBox}>
            <div className={sx.accountText}>Account 1</div>
            <div className={sx.addressBox} onClick={handleAddressCopy}>
              <div className={sx.address}>
                {addressSliceOne}...{addressSliceTwo}
              </div>
              <TbCopy name="copy" size={18} color="dimgray" />
            </div>
          </div>

          <div className={sx.subContainer}>
            <div className={sx.tokenIcon}>
              <FaEthereum name="ethereum" size={44} color="black" />
            </div>
            <div className={sx.balanceText}>
              {balance === 0 ? 0 : balance} ETH
            </div>

            <div className={sx.iconGroup}>
              <div>
                <div className={sx.icon}>
                  <MdDownload name="file-download" size={32} color="#FFF" />
                </div>
                <div className={sx.iconText}>買</div>
              </div>
              <div>
                <div onClick={handlePageChange} className={sx.icon}>
                  <FiArrowUpRight
                    name="arrow-up-right"
                    size={36}
                    color="#FFF"
                  />
                </div>
                <div className={sx.iconText}>發送</div>
              </div>
              <div>
                <div className={sx.icon}>
                  <MdOutlineSwapHoriz
                    name="swap-horiz"
                    size={36}
                    color="#FFF"
                  />
                </div>
                <div className={sx.iconText}>交換</div>
              </div>
            </div>
          </div>
        </>
      )}
      {currentPage === "send" && (
        <FindAddress
          balance={balance}
          defaultNonce={defaultNonce}
          setCurrentPage={setCurrentPage}
          setFetchDefaultDataToggle={setFetchDefaultDataToggle}
        />
      )}
    </div>
  );
};
export default Account;
