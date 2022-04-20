import {query as q} from 'faunadb'

import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

import {fauna} from '../../../services/fauna'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  ],
  secret: process.env.SIGNING_KEY,
  jwt: {
    maxAge: 60 * 60 * 24 * 14, // 2 Semanas
  },
  callbacks: {
    async session({session}) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection(
              [
                q.Match(
                  q.Index('subscription_by_user_ref'),
                  q.Select(
                    "ref",
                    q.Get(
                      q.Match(
                        q.Index('user_by_email'),
                        q.Casefold(session.user.email)
                      )
                    )
                  )
                ),
                q.Match(
                  q.Index('subscription_by_status'),
                  'active'
                )
              ]
            )
          )
        )
        session.activeSubscription = userActiveSubscription
        return session
      } catch {
        session.activeSubscription = null
        return session
      }
      
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Create a new user if necessary
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            // If true, create a new user
            q.Create(
              q.Collection('users'),
              {
                data: {
                  email: user.email,
                }
              }
            ),
            // Else
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
        return true
      }catch {
        return false
      }
    },
  },
})