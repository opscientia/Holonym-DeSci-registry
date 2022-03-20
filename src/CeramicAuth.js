// Ceramic Self.ID
import React, { useState, useEffect } from 'react'
import { useConnection, Provider } from '@self.id/framework'
// import { useConnection } from '../node_modules/@self.id/framework/src/hooks.ts'
export const ConnectButton = () => {
  const [connection, connect, disconnect] = useConnection()

  return connection.status === 'connected' ? (
    <button
      onClick={() => {
        disconnect()
      }}>
      Disconnect ({connection.selfID.id})
    </button>
  ) : 'ethereum' in window ? (
    <button
      disabled={connection.status === 'connecting'}
      onClick={() => {
        connect()
      }}>
      Connect
    </button>
  ) : (
    <p>
      An injected Ethereum provider such as{' '}
      <a href="https://metamask.io/">MetaMask</a> is needed to authenticate.
    </p>
  )
}