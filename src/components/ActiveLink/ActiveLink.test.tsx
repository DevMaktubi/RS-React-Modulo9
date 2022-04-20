import { render, screen } from "@testing-library/react";
import { ActiveLink } from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return { asPath: "/" };
    },
  };
});

describe("ActiveLink component", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassname="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(getByText("Home")).toBeInTheDocument();
  });

  it("adds active class if the link is currently active", () => {
    render(
      <ActiveLink href="/" activeClassname="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toHaveClass("active");
  });

  it("doest not add active class if the link is not currently active", () => {
    render(
      <ActiveLink href="/active" activeClassname="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).not.toHaveClass("active");
  });
});
