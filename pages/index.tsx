import React from "react"

import { Inter } from "next/font/google"
import Head from "next/head"

import EnterRaffle from "@/components/EnterRaffle"
import Header from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  return (
    <main className={inter.className}>
      <Head>
        <title>Smart Raffle</title>
      </Head>
      <Header />
      <EnterRaffle />
    </main>
  )
}
