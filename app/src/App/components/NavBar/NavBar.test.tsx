import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BlogConfig } from "../../../blog";
import { NavBar } from "./NavBar";
import { BlogProvider, EditModeProvider, Theme } from "../../state";
import { MemoryRouter } from "react-router-dom";

global.scrollTo = jest.fn();

describe("Page", () => {
  it("renders markdown", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          showInNav: true,
          content: [],
        },
        {
          path: "/",
          title: "Hidden Page",
          showInNav: false,
          content: [],
        },
      ],
    };
    const setBlog = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <NavBar/>
        </BlogProvider>
      </MemoryRouter>,
    );

    screen.getByText("Test Title");
    screen.getByText("Home");
    expect(screen.queryByText("Hidden Page")).not.toBeInTheDocument();
  });

  it("adds a new page", () => {
    let blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          showInNav: true,
          content: [],
        },
      ],
    };
    const setBlog = jest.fn((callback => { blog = callback(blog); }));
    const setEditMode = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <EditModeProvider value={{ setEditMode, editMode: true }}>
            <NavBar/>
          </EditModeProvider>
        </BlogProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("add-page-button"));

    expect(blog).toEqual({
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          showInNav: true,
          content: [],
        },
        {
          path: "/page1",
          title: "Page 1",
          content: [
            "Page 1",
          ],
        },
      ],
    });
  });

  it("changes the blog title", () => {
    let blog: BlogConfig = {
      title: "Test Title",
      pages: [
        {
          path: "/",
          title: "Home",
          showInNav: true,
          content: [],
        },
      ],
    };
    const setBlog = jest.fn((callback => { blog = callback(blog); }));
    const setEditMode = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <EditModeProvider value={{ setEditMode, editMode: true }}>
            <NavBar/>
          </EditModeProvider>
        </BlogProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByTestId("blog-title-input"), { target: { value: "Updated Title" } });

    expect(blog).toEqual({
      title: "Updated Title",
      pages: [
        {
          path: "/",
          title: "Home",
          showInNav: true,
          content: [],
        },
      ],
    });
  });

  it("toggles edit mode", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      allowEditMode: true,
      pages: [],
    };
    const setBlog = jest.fn();

    let editMode = false;
    const setEditMode = jest.fn(newEditMode => { editMode = newEditMode; });
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <EditModeProvider value={{ setEditMode, editMode }}>
            <NavBar/>
          </EditModeProvider>
        </BlogProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("edit-mode-button"));
    expect(setEditMode).toHaveBeenCalledWith(true);
    expect(editMode).toBe(true);
  });

  it("toggles theme", () => {
    const blog: BlogConfig = {
      title: "Test Title",
      allowThemeChange: true,
      pages: [],
    };
    const setBlog = jest.fn();
    
    render(
      <MemoryRouter>
        <BlogProvider value={{ setBlog, blog }}>
          <Theme initialTheme="default">
            <NavBar/>
          </Theme>
        </BlogProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("theme-wrapper")).toHaveClass("default");
    fireEvent.click(screen.getByTestId("toggle-theme-button"));
    expect(screen.queryByTestId("theme-wrapper")).toHaveClass("dark");
  });
});
