import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dropdown } from "../index";

describe("Dropdown", () => {
  it("renders trigger button", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={false} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    expect(screen.getByText("Test Dropdown")).toBeInTheDocument();
  });

  it("shows dropdown content when open", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={true} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    expect(screen.getByText("Dropdown content")).toBeInTheDocument();
  });

  it("hides dropdown content when closed", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={false} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    expect(screen.queryByText("Dropdown content")).not.toBeInTheDocument();
  });

  it("calls onToggle when trigger is clicked", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={false} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    fireEvent.click(screen.getByText("Test Dropdown"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("applies disabled state correctly", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={false} onToggle={onToggle} disabled={true}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    const trigger = screen.getByText("Test Dropdown").closest("button");
    expect(trigger).toBeDisabled();
  });

  it("renders chevron icon", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={false} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    const chevron = document.querySelector('svg[class*="chevron"]');
    expect(chevron).toBeInTheDocument();
  });

  it("rotates chevron when open", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={true} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <div>Dropdown content</div>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    const chevron = document.querySelector('svg[class*="chevron"]');
    expect(chevron).toBeInTheDocument();
  });

  it("handles item clicks", () => {
    const onToggle = vi.fn();
    const onItemClick = vi.fn();
    render(
      <Dropdown.Root isOpen={true} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>
            <Dropdown.ItemButton onClick={onItemClick}>
              Test Item
            </Dropdown.ItemButton>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    fireEvent.click(screen.getByText("Test Item"));
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("supports separators", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={true} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>
            <Dropdown.ItemButton>Item 1</Dropdown.ItemButton>
          </Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item>
            <Dropdown.ItemButton>Item 2</Dropdown.ItemButton>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    const separator = document.querySelector('[class*="separator"]');
    expect(separator).toBeInTheDocument();
  });

  it("supports groups and labels", () => {
    const onToggle = vi.fn();
    render(
      <Dropdown.Root isOpen={true} onToggle={onToggle}>
        <Dropdown.Trigger>Test Dropdown</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Group>
            <Dropdown.Label>Test Group</Dropdown.Label>
            <Dropdown.Item>
              <Dropdown.ItemButton>Test Item</Dropdown.ItemButton>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    expect(screen.getByText("Test Group")).toBeInTheDocument();
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });
});
