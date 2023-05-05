import React from "react"

import { Typography } from "@web3uikit/core"
import { ConnectButton } from "@web3uikit/web3"

const Header = () => {
  return (
    <div className="border-b-2 flex flex-row px-6">
      <Typography className="py-4 px-4 font-bold text-xl">Smart Raffle</Typography>
      <div className="ml-auto py-2 px-4">
        <ConnectButton moralisAuth={false} />
      </div>
    </div>
  )
}

export default Header
