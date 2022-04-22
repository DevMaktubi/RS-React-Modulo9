import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { getSession } from "next-auth/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";

import { client } from "../../prismic";

const post = {
  slug: "my-new-post",
  title: "My new post",
  content: "This is my new post",
  updatedAt: "22 de abril de 2022",
};

jest.mock("../../prismic", () => {
  return {
    client: {
      getByUID: jest.fn(),
    },
  };
});

jest.mock("next-auth/react", () => {
  return {
    getSession: jest.fn(),
  };
});
jest.mock("next/router");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("My new post")).toBeInTheDocument();
  });

  it("redirects user to homepage if no session is found", async () => {
    const getSessionMocked = mocked(getSession);

    // @ts-ignore
    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: {
        slug: post.slug,
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
          permanent: false,
        }),
      })
    );
  });

  it("redirects user to preview page if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(client);

    getPrismicClientMocked.getByUID.mockResolvedValueOnce({
      data: {
        title: [
          {
            type: "heading1",
            text: "My new post",
          },
        ],
        content: [
          {
            type: "paragraph",
            text: "This is my new post",
          },
        ],
      },
      last_publication_date: "2022-04-22T03:00:00Z",
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      user: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
      expires: "fake-expires",
      status: "authenticated",
      activeSubscription: null,
    });

    const response = await getServerSideProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/posts/preview/my-new-post",
          permanent: false,
        }),
      })
    );
  });

  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(client);
    getPrismicClientMocked.getByUID.mockResolvedValueOnce({
      data: {
        title: [
          {
            type: "heading1",
            text: "My new post",
          },
        ],
        content: [
          {
            type: "paragraph",
            text: "This is my new post",
          },
        ],
      },
      last_publication_date: "2022-04-22T03:00:00Z",
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      user: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
      expires: "fake-expires",
      status: "authenticated",
      activeSubscription: "fake-active-subscription",
    });

    const response = await getServerSideProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "My new post",
            content: "<p>This is my new post</p>",
            updatedAt: "22 de abril de 2022",
          },
        },
      })
    );
  });
});
