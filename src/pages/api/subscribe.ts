import { NextApiRequest, NextApiResponse } from "next"
import { query as q } from 'faunadb'
import {getSession} from 'next-auth/react'
import { fauna } from "../../services/fauna"
import stripe from "../../services/stripe"

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') {
    const {user: stripeUser} = await getSession({req})

    const faunaUser = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(stripeUser.email)
        )
      )
    )

    let customerId = faunaUser.data.stripe_customer_id;

    if(!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: stripeUser.email,
        // metadata?
      })

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), faunaUser.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id,
            }
          }
        )
      )

      customerId = stripeCustomer.id
    }

    

    

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{
        price: 'price_1KUemgGUs0cBslVlBpEMx2p7',
        quantity: 1,
      }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })

    return res.status(200).json({sessionId: stripeCheckoutSession.id})
  }else {
    res.setHeader('Allow', 'POST')
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}