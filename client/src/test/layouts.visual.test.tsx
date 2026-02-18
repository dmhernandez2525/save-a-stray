import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthLayout, DashboardLayout, PageLayout } from "@/layouts";

describe("layout visual regression baselines", () => {
  it("captures page layout structure", () => {
    const { container } = render(
      <PageLayout maxWidth="wide">
        <div>Page Body</div>
      </PageLayout>
    );

    expect(screen.getByText("Page Body")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("captures auth layout structure", () => {
    const { container } = render(
      <AuthLayout brandPanel={<div>Brand Panel</div>}>
        <div>Auth Form</div>
      </AuthLayout>
    );

    expect(screen.getByText("Auth Form")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("captures dashboard layout structure", () => {
    const { container } = render(
      <DashboardLayout header={<header>Header</header>} sidebar={<aside>Sidebar</aside>}>
        <div>Main Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
