import React, { useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";

import SendTransaction from "../SendTransaction";
import sx from "./FindAddress.module.sass";

type FindAddressProps = {
  balance: number;
  defaultNonce: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  setFetchDefaultDataToggle: React.Dispatch<React.SetStateAction<boolean>>;
};
const FindAddress = ({
  balance,
  defaultNonce,
  setCurrentPage,
  setFetchDefaultDataToggle,
}: FindAddressProps) => {
  const [sendAddress, setSendAddress] = useState("");
  const [isSendAddressVerified, setSendAddressVerified] = useState(false);

  const isSendAddressRejected = useMemo(() => {
    if (sendAddress === "") return null;
    if (isSendAddressVerified) return null;
    return <div className={sx.warningText}>接收位址錯誤</div>;
  }, [sendAddress, isSendAddressVerified]);

  const handleSendAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSendAddress(e.target.value);
      try {
        ethers.utils.getAddress(e.target.value);
        setSendAddressVerified(true);
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  const handlePageChange = useCallback(() => {
    setCurrentPage("account");
  }, [setCurrentPage]);

  return (
    <div className={sx.container}>
      <div className={sx.title}>Send to</div>
      {!isSendAddressVerified ? (
        <div className={sx.addressBox}>
          <input
            className={sx.addressInputBox}
            type="text"
            onChange={handleSendAddressChange}
            value={sendAddress}
            placeholder="搜尋公開地址(0x)"
          />
          <div className={sx.infoContent}>
            <div className={sx.rejectedText}>{isSendAddressRejected}</div>
            <div onClick={handlePageChange} className={sx.cancelButton}>
              返回
            </div>
          </div>
        </div>
      ) : (
        <SendTransaction
          sendAddress={sendAddress}
          balance={balance}
          defaultNonce={defaultNonce}
          setCurrentPage={setCurrentPage}
          setFetchDefaultDataToggle={setFetchDefaultDataToggle}
          setSendAddressVerified={setSendAddressVerified}
        />
      )}
    </div>
  );
};
export default FindAddress;
