import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BlogConfig } from "../../../blog";
import { Page } from "./Page";
import { BlogProvider, EditModeProvider } from "../../state";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";

global.scrollTo = jest.fn();

describe("Page", () => {
  it("renders markdown", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            "First paragraph text",
            "Second paragraph text",
          ],
        },
      ],
    };
    const setBlog = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <Page/>
        </BlogProvider>
      </MemoryRouter>,
    );

    // Check to see that the page contents render
    screen.getByText("First paragraph text");
    screen.getByText("Second paragraph text");
  });

  it("renders code content", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            {
              type: "code",
              language: "javascript",
              lines: [
                "const foo = 123;",
              ],
            },
          ],
        },
      ],
    };
    const setBlog = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <Page/>
        </BlogProvider>
      </MemoryRouter>,
    );

    screen.getByText(text => text.includes("const foo = 123;"));
  });

  it("renders blog editor", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            {
              type: "blogEditor",
            },
          ],
        },
      ],
    };
    const setBlog = jest.fn();
    
    // Since the editor component is stubbed, just test that there are no errors when rendering
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <Page/>
        </BlogProvider>
      </MemoryRouter>,
    );
  });

  it("renders lists", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            {
              type: "orderedList",
              value: [
                "Ordered1",
                "Ordered2",
              ],
            },
            {
              type: "unorderedList",
              value: [
                "Unordered1",
                "Unordered2",
              ],
            },
          ],
        },
      ],
    };
    const setBlog = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <Page/>
        </BlogProvider>
      </MemoryRouter>,
    );

    screen.getByText(text => text.includes("1. Ordered1"));
    screen.getByText(text => text.includes("2. Ordered2"));
    screen.getByText(text => text.includes("- Unordered1"));
    screen.getByText(text => text.includes("- Unordered2"));
  });

  it("edits page content", () => {
    let blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            "First paragraph text",
            "Second paragraph text",
          ],
        },
      ],
    };
    const setBlog = jest.fn(callback => { blog = callback(blog); });
    const setEditMode = jest.fn();
    
    render(
      <MemoryRouter>
        <EditModeProvider value={{ setEditMode, editMode: true }}>
          <BlogProvider value={{ setBlog, blog }}>
            <Page/>
          </BlogProvider>
        </EditModeProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByText("First paragraph text")).toBeInTheDocument();

    // delete content item
    act(() => {
      fireEvent.click(screen.getByTestId("content0"));
      fireEvent.click(screen.getByTestId("add-content-item-button"));
    });

    expect(setBlog).toHaveBeenCalled();
    expect(blog).toEqual({
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            "Second paragraph text",
            "",
          ],
        },
      ],
    });
  });

  it("edits page metadata", () => {
    let blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          content: [
            "First paragraph text",
            "Second paragraph text",
          ],
        },
      ],
    };
    const setBlog = jest.fn(callback => { blog = callback(blog); });
    const setEditMode = jest.fn();
    
    render(
      <MemoryRouter>
        <EditModeProvider value={{ setEditMode, editMode: true }}>
          <BlogProvider value={{ setBlog, blog }}>
            <Page/>
          </BlogProvider>
        </EditModeProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Title")).toBeInTheDocument();
    expect(screen.getByTestId("page-title-input")).toHaveValue("Home");

    expect(screen.queryByText("Path")).toBeInTheDocument();
    expect(screen.getByTestId("page-path-input")).toHaveValue("/");

    expect(screen.queryByText("Show in Nav Bar")).toBeInTheDocument();
    expect(screen.getByTestId("page-showInNav-checkbox")).not.toBeChecked();

    act(() => {
      fireEvent.change(screen.getByTestId("page-title-input"), { target: { value: "New Title" } });
      fireEvent.change(screen.getByTestId("page-path-input"), { target: { value: "/new-path" } });
      fireEvent.click(screen.getByTestId("page-showInNav-checkbox"));
    });

    expect(setBlog).toHaveBeenCalled();

    expect(blog).toEqual({
      title: "Test Title",
      pages: [
        {
          path: "/new-path",
          title: "New Title",
          showInNav: true,
          content: [
            "First paragraph text",
            "Second paragraph text",
          ],
        },
      ],
    });
  });
});
