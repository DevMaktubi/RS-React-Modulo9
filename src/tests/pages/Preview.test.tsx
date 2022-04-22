import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Preview, { getStaticProps } from "../../pages/posts/preview/[slug]";

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
    useSession: jest.fn(),
  };
});
jest.mock("next/router");

describe("Preview", () => {
  it("renders correctly", () => {
    const mockedUseSession = mocked(useSession);
    const mockedRouter = mocked(useRouter);

    mockedRouter.mockReturnValueOnce({
      push: jest.fn(),
    } as any);

    mockedUseSession.mockReturnValueOnce({
      data: {
        activeSubscription: "fake-active-subscription",
      },
    } as any);
    render(<Preview post={post} />);

    expect(screen.getByText("My new post")).toBeInTheDocument();
    expect(screen.getByText("This is my new post")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const mockedUseSession = mocked(useSession);
    const mockedCreateClient = mocked(client);

    mockedUseSession.mockReturnValueOnce({
      data: {
        activeSubscription: "fake-active-subscription",
      },
    } as any);

    mockedCreateClient.getByUID.mockResolvedValueOnce({
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

    const response = await getStaticProps({
      params: {
        slug: post.slug,
      },
    });

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

  it("redirects user to post page if authenticated", async () => {
    const mockedUseSession = mocked(useSession);
    const mockedRouter = mocked(useRouter);

    const pushMock = jest.fn();

    mockedRouter.mockReturnValueOnce({
      push: pushMock,
    } as any);

    // @ts-ignore
    mockedUseSession.mockReturnValueOnce({
      data: {
        activeSubscription: "fake-active-subscription",
      },
    } as any);

    render(<Preview post={post} />);

    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
  });
});
