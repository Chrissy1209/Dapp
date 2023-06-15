import React, { useState, useCallback, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import clsx from "clsx";

import sx from "./SendTransaction.module.sass";

type SendTransactionProps = {
  sendAddress: string;
  balance: number;
  defaultNonce: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  setFetchDefaultDataToggle: React.Dispatch<React.SetStateAction<boolean>>;
  setSendAddressVerified: React.Dispatch<React.SetStateAction<boolean>>;
  setSendAddress: React.Dispatch<React.SetStateAction<string>>;
};
const SendTransaction = ({
  sendAddress,
  balance,
  defaultNonce,
  setCurrentPage,
  setFetchDefaultDataToggle,
  setSendAddressVerified,
  setSendAddress,
}: SendTransactionProps) => {
  const [sendAmount, setSendAmount] = useState("");
  const [maxPriorityFee, setMaxPriorityFee] = useState("");
  const [baseFee, setBaseFee] = useState("");

  const [isSendingTransaction, setSendingTransaction] = useState(false);

  const isSubmitAvailable = useMemo(
    () => balance >= Number(sendAmount),
    [balance, sendAmount]
  );

  const confirmButtonStyle = useMemo(() => {
    return clsx({
      [sx.button]: true,
      [!isSubmitAvailable || isSendingTransaction
        ? sx.disabledButton
        : sx.confirmButton]: true,
    });
  }, [isSubmitAvailable, isSendingTransaction]);

  const handleSendAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!/^\d*\.?\d*$/.test(e.target.value)) return;

      // . -> 0.
      if (e.target.value === ".") setSendAmount(`0${e.target.value}`);
      // 00 -> 0
      else if (e.target.value === "00") setSendAmount("0");
      // 00 -> 0 || 01 -> 1
      else if (
        e.target.value[0] === "0" &&
        e.target.value[1] !== "." &&
        e.target.value.length === 2
      )
        setSendAmount(e.target.value.slice(1, 2));
      else {
        setSendAmount(e.target.value);
      }
    },
    []
  );

  const handleBaseFeeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === "") setBaseFee("");
      if (!/^\d+$/.test(e.target.value)) return;

      // 00 -> 0 || 01 -> 1
      if (
        e.target.value[0] === "0" &&
        e.target.value[1] !== "." &&
        e.target.value.length === 2
      )
        setBaseFee(e.target.value.slice(1, 2));
      else {
        setBaseFee(e.target.value);
      }
    },
    []
  );

  const handleMaxPriorityFeeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!/^\d*\.?\d*$/.test(e.target.value)) return;

      // . -> 0.
      if (e.target.value === ".") setMaxPriorityFee(`0${e.target.value}`);
      // 00 -> 0
      else if (e.target.value === "00") setMaxPriorityFee("0");
      // 00 -> 0 || 01 -> 1
      else if (
        e.target.value[0] === "0" &&
        e.target.value[1] !== "." &&
        e.target.value.length === 2
      )
        setMaxPriorityFee(e.target.value.slice(1, 2));
      else {
        setMaxPriorityFee(e.target.value);
      }
    },
    []
  );

  const handlePageChange = useCallback(() => {
    setCurrentPage("account");
  }, [setCurrentPage]);

  const handleSendAddressEmtpy = useCallback(() => {
    setSendAddressVerified(false);
    setSendAddress("");
    setSendAmount("");
    setMaxPriorityFee("");
    setBaseFee("");
  }, [setSendAddressVerified, setSendAddress]);

  const handleSendTransaction = useCallback(() => {
    setSendingTransaction(true);
    const sendingTransaction = async () => {
      if (sendAmount === "" || sendAmount === "0.") setSendAmount("0");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        const signedTransaction = await signer.sendTransaction({
          to: sendAddress,
          value: sendAmount
            ? ethers.utils.parseEther(sendAmount)
            : ethers.utils.parseEther("0"),
          // maxFeePerGas: ethers.BigNumber.from((baseFee as any) * 1000000000),
          // maxPriorityFeePerGas: ethers.BigNumber.from(maxPriorityFee),
        });
        if (signedTransaction.nonce > defaultNonce) {
          window.alert("交易被排隊等待，確認並返回首頁。");
          setCurrentPage("account");
          return;
        }
        await provider.waitForTransaction(signedTransaction.hash);
        setFetchDefaultDataToggle((pre) => !pre);
        setSendingTransaction(false);
        setCurrentPage("account");
      } catch (error) {
        setSendingTransaction(false);
        window.alert("交易失敗，你確定要結束本次交易嗎？");
        setCurrentPage("account");
      }
    };
    sendingTransaction();
  }, [
    sendAddress,
    sendAmount,
    // maxPriorityFee,
    // baseFee,
    defaultNonce,
    setFetchDefaultDataToggle,
    setCurrentPage,
  ]);

  useEffect(() => {
    const getGasPrice = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);

        // const priorityFee = block.gasUsed.mul(block.baseFeePerGas|| null);
        const baseFee = block.baseFeePerGas;
        setBaseFee(String(baseFee));
      } catch (error) {
        console.log(error);
      }
    };
    getGasPrice();
  }, []);

  return (
    <div className={sx.container}>
      <div className={sx.addressBox}>
        <div className={sx.address}>{sendAddress}</div>
        <div className={sx.sendAddressEmtpy} onClick={handleSendAddressEmtpy}>
          X
        </div>
      </div>
      <div className={sx.verifiedText}>偵測到錢包位址！</div>

      <div className={sx.transactionInfoBox}>
        <div className={sx.transitionInfoRow}>
          <div className={sx.infoTitle}>Default Nonce:</div>
          <div className={sx.infoText}>{defaultNonce}</div>
        </div>
        <div className={sx.transitionInfoRow}>
          <div className={sx.infoTitle}>資產：</div>
          <div className={sx.infoText}>{balance === 0 ? 0 : balance} ETH</div>
        </div>
        <div className={sx.transitionInfoRow}>
          <div className={sx.infoTitle}>Amount:</div>
          <input
            onChange={handleSendAmountChange}
            value={sendAmount}
            placeholder="0"
            className={sx.inputText}
          />
        </div>
        <div className={sx.transitionInfoRow}>
          <div className={sx.infoTitle}>Base Fee:</div>
          <input
            onChange={handleBaseFeeChange}
            value={baseFee}
            placeholder={String(baseFee)}
            className={sx.inputText}
          />
        </div>
        <div className={sx.transitionInfoRow}>
          <div className={sx.infoTitle}>Max Priority Fee: (GWEI)</div>
          <input
            onChange={handleMaxPriorityFeeChange}
            value={maxPriorityFee}
            placeholder=""
            className={sx.inputText}
          />
        </div>
        {!isSubmitAvailable && <div className={sx.warningText}>資金不足</div>}
        {isSendingTransaction && (
          <div className={sx.processingText}>交易處理中 . . .</div>
        )}
      </div>

      <div className={sx.buttonGroup}>
        <div onClick={handlePageChange} className={sx.button}>
          <div className={sx.cancelButtonText}>返回</div>
        </div>

        <div
          onClick={
            !isSubmitAvailable || isSendingTransaction
              ? undefined
              : handleSendTransaction
          }
          className={confirmButtonStyle}
        >
          <div className={sx.confirmButtonText}>確認</div>
        </div>
      </div>
    </div>
  );
};
export default SendTransaction;
