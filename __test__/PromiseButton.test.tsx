import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PromiseButton from "../components/buttons/PromiseButton";

describe("PromiseButton", () => {
  it("calls onPress and shows success icon when promise resolves", async () => {
    const onPressMock = vi.fn().mockResolvedValue(undefined);

    render(
      <PromiseButton onPress={onPressMock} color="primary">
        Click me
      </PromiseButton>
    );

    // Ensure the initial children are rendered.
    expect(screen.getByText("Click me")).toBeInTheDocument();

    // Click the button.
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onPressMock).toHaveBeenCalled();
    console.log("Button clicked");

    await waitFor(() => {
      const element = screen.getByTestId("success-icon");
      expect(element).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });
  });
  it("calls onPress and shows failure icon when promise rejects", async () => {
    const onPressMock = vi.fn().mockRejectedValue(new Error("Failed"));

    render(
      <PromiseButton onPress={onPressMock} color="primary">
        Click me
      </PromiseButton>
    );

    // Initial render should show children.
    expect(screen.getByText("Click me")).toBeInTheDocument();

    // Click the button.
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onPressMock).toHaveBeenCalled();

    // When onPress rejects, the failure state should be set,
    // and the X icon (rendered as an <svg>) should appear.
    await waitFor(() => {
      expect(button.querySelector("svg")).toBeInTheDocument();
    });

    // The button should revert back to displaying its original children.
    await waitFor(() => {
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });
  });
});
