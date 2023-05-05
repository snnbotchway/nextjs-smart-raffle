import React, { useEffect } from "react"
import { useMoralis } from "react-moralis"

const Header = () => {
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    deactivateWeb3,
    Moralis,
    chainId,
    isWeb3EnableLoading,
  } = useMoralis()

  useEffect(() => {
    async function main() {
      if (!isWeb3Enabled && localStorage.getItem("web3enabled")) {
        await enableWeb3()
      }
    }
    main()
  }),
    [isWeb3Enabled, enableWeb3]

  useEffect(() => {
    Moralis.onAccountChanged(() => {
      if (!account) {
        localStorage.removeItem("web3enabled")
        deactivateWeb3()
      }
    })
  }, [Moralis, deactivateWeb3, account])

  return (
    <div>
      {account && chainId ? (
        <div>
          Connected with {account} on {parseInt(chainId.toString())}
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3()
            localStorage.setItem("web3enabled", "true")
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  )
}

export default Header
