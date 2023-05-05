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
  const [playerCount, setPlayerCount] = useState(0)
  const [contractBalance, setContractBalance] = useState("0")
  const [recentWinner, setRecentWinner] = useState(ethers.constants.AddressZero)
  const [interval, setIntervalState] = useState(0)
  const [lastTimeStamp, setLastTimeStamp] = useState(0)

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

  const { runContractFunction: getInterval } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "getInterval",
    params: {},
  })

  const { runContractFunction: getLastTimeStamp } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress!,
    functionName: "getLastTimeStamp",
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
      title: "Transaction Notification",
      position: "topR",
    })
  }

  async function updateUI() {
    const contractEntryFee = ((await getEntryFee()) as BigNumber).toString()
    const contractPlayerCount = parseInt(((await getPlayerCount()) as BigNumber).toString())
    const recentWinner = (await getRecentWinner()) as string
    const interval = parseInt(((await getInterval()) as BigNumber).toString())
    const lastTimeStamp = parseInt(((await getLastTimeStamp()) as BigNumber).toString())
    const contractBalance = (await raffle.provider.getBalance(raffleAddress as string)).toString()

    setContractBalance(contractBalance)
    setEntryFee(contractEntryFee)
    setPlayerCount(contractPlayerCount)
    setRecentWinner(recentWinner)
    setIntervalState(interval)
    setLastTimeStamp(lastTimeStamp)
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

  function formatInterval(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor(((seconds % 86400) % 3600) / 60)
    const secondsFormatted = Math.floor(((seconds % 86400) % 3600) % 60)

    if (days > 0) {
      return `${days} days`
    } else if (hours > 0) {
      return `${hours} hours ${minutes} minutes`
    } else if (minutes > 0) {
      return `${minutes} minutes ${secondsFormatted} seconds`
    } else {
      return `${secondsFormatted} seconds`
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const monthsOfYear = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const dayOfWeek = daysOfWeek[date.getDay()]
    const month = monthsOfYear[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    const hour = ("0" + date.getHours()).slice(-2)
    const minute = ("0" + date.getMinutes()).slice(-2)

    return `${dayOfWeek}, ${month} ${day}, ${year} at ${hour}:${minute}`
  }

  const intervalFormatted = formatInterval(interval)
  const nextWinnerPick = lastTimeStamp + interval
  const nextWinnerPickFormatted = formatDate(nextWinnerPick)

  return (
    <div className="p-10">
      {raffleAddress ? (
        <div>
          <Typography className="block">
            Current Prize Pool:{" "}
            <strong>{ethers.utils.formatUnits(contractBalance, "ether").toString()} ETH</strong>
          </Typography>
          <Typography className="block">
            Current number of players: <strong>{playerCount}</strong>
          </Typography>
          {recentWinner != ethers.constants.AddressZero && (
            <Typography className="block">
              <strong>
                Most recent winner: <strong>{recentWinner}</strong>
              </strong>
            </Typography>
          )}
          <Typography className="block">
            A winner is picked every <strong>{intervalFormatted}</strong>
          </Typography>
          <Typography className="block">
            Next winner pick on <strong>{nextWinnerPickFormatted}</strong>
          </Typography>
          <div className="my-4">
            <Button
              color="blue"
              onClick={() => {
                enterRaffle({
                  onSuccess: handleSuccess,
                  onError: (error) => console.error(error),
                }).then(() =>
                  handleNotification("Transaction submitted, please wait for confirmation", "info")
                )
              }}
              text={`Enter Raffle with ${ethers.utils
                .formatUnits(entryFee, "ether")
                .toString()} ETH`}
              theme="colored"
              isLoading={isFetching || isLoading}
            />
          </div>
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
