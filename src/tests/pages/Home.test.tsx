import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useSession } from "next-auth/react";
import Home, { getStaticProps } from "../../pages";
import stripe from "../../services/stripe";

jest.mock("next-auth/react");

jest.mock("../../services/stripe");

describe("Home page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: "John Doe",
          email: "john.doe@example.com",
        },
        activeSubscription: "fake-active",
        expires: "fake-expires",
      },
      status: "authenticated",
    });
    render(<Home product={{ priceId: "fake-priceId", amount: "R$10,00" }} />);

    expect(screen.getByText("R$10,00", { exact: false })).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const retrieveStripePricesMocked = mocked(stripe.prices.retrieve);

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: "fake-priceId",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: "fake-priceId",
            amount: "$10.00",
          },
        },
      })
    );
  });
});
