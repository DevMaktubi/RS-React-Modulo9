import { SessionProvider } from 'next-auth/react'
import {AppProps} from 'next/app'
import { Header } from '../components/Header'

import {PrismicProvider} from '@prismicio/react'
import { client } from '../prismic'

import '../styles/global.scss'

function MyApp({ Component, pageProps: {session, ...pageProps} }: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <Header />
        <PrismicProvider client={client}>
          <Component {...pageProps} />
        </PrismicProvider>
      </SessionProvider>
    </>
  )
}

export default MyApp
