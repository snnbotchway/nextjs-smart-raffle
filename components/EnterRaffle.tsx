import { abi, contractAddresses } from "@/constants"
import { BigNumber, Contract, ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"

import { Button, Typography, notifyType, useNotification } from "@web3uikit/core"

interface contractAddressesInterface {
  [key: string]: string[]
}

const EnterRaffle = () => {
  const [entryFee, setEntryFee] = useState("0")
  const [playerCount, setPlayerCount] = useState("0")
  const [contractBalance, setContractBalance] = useState("0")
  const [recentWinner, setRecentWinner] = useState(ethers.constants.AddressZero)

  const { chainId: hexChainId, isWeb3Enabled, account, web3 } = useMoralis()
  const chainId = parseInt(hexChainId!).toString()
  const addresses: contractAddressesInterface = contractAddresses
  const raffleAddress = chainId in addresses ? addresses[chainId][0] : null

  const dispatch = useNotification()

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "enterRaffle",
    params: {},
    msgValue: entryFee,
  })

  const { runContractFunction: getEntryFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "getEntryFee",
    params: {},
  })

  const { runContractFunction: getPlayerCount } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "getPlayerCount",
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "getRecentWinner",
    params: {},
  })

  let raffle!: Contract

  if (account && isWeb3Enabled && raffleAddress) {
    const signer = web3?.getUncheckedSigner(account as string)
    raffle = new ethers.Contract(raffleAddress as string, abi, signer)
  }

  function handleNotification(message: string, type: notifyType) {
    dispatch({
      type,
      message,
      title: "Tx Notification",
      position: "topR",
    })
  }

  async function updateUI() {
    const contractEntryFee = ((await getEntryFee()) as BigNumber).toString()
    const contractPlayerCount = ((await getPlayerCount()) as BigNumber).toString()
    const recentWinner = (await getRecentWinner()) as string
    const contractBalance = (await raffle.provider.getBalance(raffleAddress as string)).toString()

    setContractBalance(contractBalance)
    setEntryFee(contractEntryFee)
    setPlayerCount(contractPlayerCount)
    setRecentWinner(recentWinner)
  }

  useEffect(() => {
    if (account && isWeb3Enabled && raffleAddress) {
      updateUI()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isWeb3Enabled, raffleAddress])

  async function handleSuccess(tx: any) {
    await tx.wait(1)
    handleNotification("You have entered the raffle", "success")
    updateUI()
  }

  return (
    <div className="p-10">
      {raffleAddress ? (
        <div>
          <div className="my-4">
            <Button
              color="blue"
              onClick={async () => {
                await enterRaffle({
                  onSuccess: handleSuccess,
                  onError: (error) => console.error(error),
                })
              }}
              text="Enter Raffle"
              theme="colored"
              isLoading={isFetching || isLoading}
            />
          </div>

          <p>Current number of players: {playerCount}</p>
          {entryFee && (
            <p>Raffle entry fee: {ethers.utils.formatUnits(entryFee, "ether").toString()} ETH</p>
          )}
          <p>
            Current Prize Pool: {ethers.utils.formatUnits(contractBalance, "ether").toString()} ETH
          </p>
          <p>Most recent winner: {recentWinner}</p>
        </div>
      ) : account ? (
        <Typography>Please switch to the sepolia network to continue.</Typography>
      ) : (
        <Typography>Please connect your Wallet to continue.</Typography>
      )}
    </div>
  )
}

export default EnterRaffle
