import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import Posts, { getStaticProps, Post } from "../../pages/posts";

import { client } from "../../prismic";

const posts = [
  {
    slug: "fake-slug",
    title: "Fake title 1",
    excerpt: "Fake excerpt 1",
    updatedAt: "2020-01-01",
  },
] as Post[];

jest.mock("../../prismic", () => {
  return {
    client: {
      getAllByType: jest.fn(),
    },
  };
});

describe("Posts page", () => {
  it("renders correctly", () => {
    render(<Posts data={posts} />);
    const getPrismicClientMocked = mocked(client);
    getPrismicClientMocked.getAllByType.mockResolvedValue({
      data: posts,
    } as any);

    expect(screen.getByText("Fake title 1")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(client);

    getPrismicClientMocked.getAllByType.mockReturnValueOnce([
      {
        uid: "fake-slug",
        data: {
          title: [
            {
              type: "heading1",
              text: "Fake title 1",
            },
          ],
          content: [
            {
              type: "paragraph",
              text: "Fake excerpt 1",
            },
          ],
        },
        last_publication_date: "2022-04-22T03:00:00.000Z",
      },
    ] as any);

    const response = await getStaticProps({ previewData: undefined });

    console.log(response);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          data: [
            {
              slug: "fake-slug",
              title: "Fake title 1",
              excerpt: "Fake excerpt 1",
              updatedAt: "22 de abril de 2022",
            },
          ],
        },
      })
    );
  });
});
