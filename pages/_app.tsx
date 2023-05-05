import { MoralisProvider } from "react-moralis"

import type { AppProps } from "next/app"

import { NotificationProvider } from "@web3uikit/core"

import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  )
}
