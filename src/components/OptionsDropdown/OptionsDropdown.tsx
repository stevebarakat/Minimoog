import { useOptions } from "./hooks/useOptions";
import { Dropdown } from "@/components/Dropdown";
import { Settings } from "lucide-react";
import { cn } from "@/utils";
import "@/styles/dropdown-shared.css";

type OptionsDropdownProps = {
  disabled: boolean;
  maxWidth?: string;
};

function OptionsDropdown({ disabled, maxWidth }: OptionsDropdownProps) {
  const { isOpen, setIsOpen, settings, handleToggleSetting } = useOptions();

  const settingOptions = [
    {
      id: "welcomeTour" as const,
      name: "Welcome Tour",
      description: "Show the welcome tour when the app is first opened",
    },
    {
      id: "tooltips" as const,
      name: "Learning Mode",
      description: "Show helpful tooltips when hovering over controls",
    },
    {
      id: "magnifyKnobs" as const,
      name: "Magnify Knobs",
      description: "Enlarge the knobs when being used for more precise control",
    },
  ];

  return (
    <div className="dropdown-container" data-onboarding="options">
      <Dropdown.Root
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        ariaLabel="User Settings"
        ariaExpanded={isOpen}
        ariaHasPopup="menu"
        className="dropdown-wrapper"
      >
        <Dropdown.Trigger
          disabled={disabled}
          segmented={true}
          icon={<Settings />}
        >
          Options
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Listbox
            aria-label="User settings options"
            options={settingOptions}
            optionCount={3}
          >
            <div className="dropdown-scrollable-list" style={{ maxWidth }}>
              {settingOptions.map((option) => (
                <Dropdown.Item
                  key={option.id}
                  role="option"
                  aria-selected={settings[option.id]}
                  className="dropdown-option"
                >
                  <Dropdown.ItemButton
                    onClick={() => handleToggleSetting(option.id)}
                    className={cn(
                      "dropdown-button",
                      settings[option.id] && "selected"
                    )}
                  >
                    <div className="dropdown-content">
                      <div className="dropdown-label-container">
                        <span className="dropdown-label">{option.name}</span>
                        {settings[option.id] ? (
                          <span className="active-label">On</span>
                        ) : (
                          <span className="inactive-label">Off</span>
                        )}
                      </div>
                      <span className="dropdown-description">
                        {option.description}
                      </span>
                    </div>
                  </Dropdown.ItemButton>
                </Dropdown.Item>
              ))}
            </div>
          </Dropdown.Listbox>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}

export default OptionsDropdown;
