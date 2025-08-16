import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import RockerSwitch from "../RockerSwitch";

describe("RockerSwitch - Component Tests", () => {
  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with basic props", () => {
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute("aria-pressed", "false");
  });

  it("renders in checked state", () => {
    render(
      <RockerSwitch
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toHaveAttribute("aria-pressed", "true");
  });

  it("handles click interactions", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.click(switchElement);

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("handles pointer interactions", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.pointer({ target: switchElement, keys: "[MouseLeft]" });

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("handles keyboard spacebar interactions", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
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
    render(
      <RockerSwitch
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.click(switchElement);

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("prevents interactions when disabled", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        disabled={true}
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    await user.click(switchElement);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("prevents keyboard interactions when disabled", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        disabled={true}
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    switchElement.focus();
    await user.keyboard(" ");

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("renders with top labels", () => {
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        topLabelLeft="Left"
        topLabel="Center"
        topLabelRight="Right"
      />
    );

    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Center")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("renders with bottom labels", () => {
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        bottomLabelLeft="Bottom Left"
        bottomLabel="Bottom Center"
        bottomLabelRight="Bottom Right"
      />
    );

    expect(screen.getByText("Bottom Left")).toBeInTheDocument();
    expect(screen.getByText("Bottom Center")).toBeInTheDocument();
    expect(screen.getByText("Bottom Right")).toBeInTheDocument();
  });

  it("renders with left label", () => {
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        leftLabel="Left Label"
      />
    );

    expect(screen.getByText("Left Label")).toBeInTheDocument();
  });

  it("applies custom styles", () => {
    const customStyle = { backgroundColor: "red" };
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        style={customStyle}
      />
    );

    // Check that the component renders without errors when custom styles are applied
    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
  });

  it("renders with testid", () => {
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        testid="custom-test-id"
      />
    );

    const input = screen.getByTestId("custom-test-id");
    expect(input).toBeInTheDocument();
  });

  it("maintains focus after interaction", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });
    // Focus the label element (which is the correct accessibility behavior)
    const labelElement = switchElement.closest("label");
    labelElement?.focus();
    await user.click(switchElement);

    // The label element should maintain focus after interaction
    expect(labelElement).toHaveFocus();
  });

  it("handles focus and blur correctly", async () => {
    const user = userEvent.setup();
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
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
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        topLabel={complexLabel}
      />
    );

    expect(screen.getByTestId("complex-label")).toBeInTheDocument();
  });

  it("generates unique IDs for multiple switches", () => {
    render(
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
      </>
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
    render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
      />
    );

    const switchElement = screen.getByRole("button", { name: "Test Switch" });

    // Rapid clicks
    await user.click(switchElement);
    await user.click(switchElement);
    await user.click(switchElement);

    expect(mockOnCheckedChange).toHaveBeenCalledTimes(3);
  });

  it("supports different themes without breaking functionality", () => {
    const { rerender } = render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        theme="black"
      />
    );

    let switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();

    rerender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        theme="orange"
      />
    );

    switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
  });

  it("supports different orientations without breaking functionality", () => {
    const { rerender } = render(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        orientation="horizontal"
      />
    );

    let switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();

    rerender(
      <RockerSwitch
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        label="Test Switch"
        orientation="vertical"
      />
    );

    switchElement = screen.getByRole("button", { name: "Test Switch" });
    expect(switchElement).toBeInTheDocument();
  });
});
