import * as Toast from "@radix-ui/react-toast";

// Helper to sanitize array descriptions: only render string content, never React elements
export function renderDescription(desc: string | string[] | undefined) {
  if (Array.isArray(desc)) {
    return (
      <Toast.Description style={{ marginTop: 4 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {desc.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              {typeof item === "string" ? item : ""}
            </li>
          ))}
        </ul>
      </Toast.Description>
    );
  } else if (typeof desc === "string") {
    return (
      <Toast.Description style={{ marginTop: 4 }}>{desc}</Toast.Description>
    );
  } else {
    return null;
  }
}
