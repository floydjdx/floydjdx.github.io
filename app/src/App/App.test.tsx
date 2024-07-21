import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { BlogConfig } from "../blog";

global.scrollTo = jest.fn();

const testBlog: BlogConfig = {
  title: "Test Title",
  pages: [
    {
      path: "/",
      title: "Home",
      showInNav: true,
      content: [
        "Hello world",
      ],
    },
    {
      path: "/about",
      title: "About",
      showInNav: true,
      content: [
        "The about page",
      ],
    },
    {
      path: "/hidden",
      title: "Hidden Page",
      showInNav: false,
      content: [
        "Hidden content",
      ],
    },
  ],
};

describe("App", () => {
  it("renders home page", () => {
    render(<App blog={testBlog} />);
    expect(screen.queryByText("Test Title")).toBeInTheDocument();

    // The currently active page
    expect(screen.queryByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Hello world")).toBeInTheDocument();

    // A page in the nav that isn't active
    expect(screen.queryByText("About")).toBeInTheDocument();
    expect(screen.queryByText("The about page")).not.toBeInTheDocument();
    
    // A page that isn't in the nav and isn't active
    expect(screen.queryByText("Hidden Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });
});
