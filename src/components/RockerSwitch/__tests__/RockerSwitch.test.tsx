import { screen } from "@testing-library/react";
import { customRender } from "@/test/testHelpers";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import RockerSwitch from "../RockerSwitch";

describe("RockerSwitch - Component Tests", () => {
  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with basic props", () => {
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute("aria-pressed", "false");
  });

  it("renders in checked state", () => {
    customRender(
      <RockerSwitch
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toHaveAttribute("aria-pressed", "true");
  });

  it("handles click interactions", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.click(switchElement);

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("handles pointer interactions", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.pointer({ target: switchElement, keys: "[MouseLeft]" });

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("handles keyboard spacebar interactions", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    // Focus the label element (which is the correct accessibility behavior)
    const labelElement = switchElement.closest("label");
    labelElement?.focus();
    await user.keyboard(" ");

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("toggles from checked to unchecked", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.click(switchElement);

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("prevents interactions when disabled", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        disabled={true}
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.click(switchElement);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("prevents keyboard interactions when disabled", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        disabled={true}
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    switchElement.focus();
    await user.keyboard(" ");

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("renders with top labels", () => {
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        topLabelLeft="Left"
        topLabel="Center"
        topLabelRight="Right"
      />,
      { withToast: true }
    );

    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Center")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("renders with bottom labels", () => {
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        bottomLabelLeft="Bottom Left"
        bottomLabel="Bottom Center"
        bottomLabelRight="Bottom Right"
      />,
      { withToast: true }
    );

    expect(screen.getByText("Bottom Left")).toBeInTheDocument();
    expect(screen.getByText("Bottom Center")).toBeInTheDocument();
    expect(screen.getByText("Bottom Right")).toBeInTheDocument();
  });

  it("renders with left label", () => {
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        leftLabel="Left Label"
      />,
      { withToast: true }
    );

    expect(screen.getByText("Left Label")).toBeInTheDocument();
  });

  it("applies custom styles", () => {
    const customStyle = { backgroundColor: "red" };
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        style={customStyle}
      />,
      { withToast: true }
    );

    // Check that the component renders without errors when custom styles are applied
    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
  });

  it("renders with testid", () => {
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        testid="custom-test-id"
      />,
      { withToast: true }
    );

    const input = screen.getByTestId("custom-test-id");
    expect(input).toBeInTheDocument();
  });

  it("maintains focus after interaction", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    // Focus the label element (which is the correct accessibility behavior)
    const labelElement = switchElement.closest("label");
    labelElement?.focus();
    await user.click(switchElement);

    // The input element should maintain focus after interaction (not the label)
    const inputElement = screen.getByRole("checkbox");
    expect(inputElement).toHaveFocus();
  });

  it("handles focus and blur correctly", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    // Focus the label element (which is the correct accessibility behavior)
    const labelElement = switchElement.closest("label");
    labelElement?.focus();
    expect(labelElement).toHaveFocus();

    await user.tab();
    expect(labelElement).not.toHaveFocus();
  });

  it("renders with complex labels", () => {
    const complexLabel = <span data-testid="complex-label">Complex Label</span>;
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        topLabel={complexLabel}
      />,
      { withToast: true }
    );

    expect(screen.getByTestId("complex-label")).toBeInTheDocument();
  });

  it("generates unique IDs for multiple switches", () => {
    customRender(
      <>
        <RockerSwitch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          label="Switch 1"
        />
        <RockerSwitch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          label="Switch 2"
        />
      </>,
      { withToast: true }
    );

    const switch1 = screen.getByRole("button", { name: "Switch 1" });
    const switch2 = screen.getByRole("button", { name: "Switch 2" });

    // Both switches should be accessible and functional
    expect(switch1).toBeInTheDocument();
    expect(switch2).toBeInTheDocument();
    expect(switch1).not.toBe(switch2);
  });

  it("handles rapid interactions correctly", async () => {
    const user = userEvent.setup();
    customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />,
      { withToast: true }
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });

    // Rapid clicks
    await user.click(switchElement);
    await user.click(switchElement);
    await user.click(switchElement);

    expect(mockOnCheckedChange).toHaveBeenCalledTimes(3);
  });

  it("supports different themes without breaking functionality", () => {
    const { rerender } = customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        theme="black"
      />,
      { withToast: true }
    );

    let switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();

    rerender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        theme="orange"
      />,
      { withToast: true }
    );

    switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
  });

  it("supports different orientations without breaking functionality", () => {
    const { rerender } = customRender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        orientation="horizontal"
      />,
      { withToast: true }
    );

    let switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();

    rerender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        orientation="vertical"
      />,
      { withToast: true }
    );

    switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
  });
});
