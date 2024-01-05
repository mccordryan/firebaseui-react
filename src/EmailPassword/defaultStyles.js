export const validInputStyle = {
  display: "block",
  width: "100%",
  borderRadius: "0.375rem",
  border: "0",
  padding: "0.375rem",
  color: "#1a202c",
  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  outline: "1px solid #d1d5db",
  placeholder: { color: "#9ca3af" },
  ":focus": {
    outline: "2px solid #4f46e5",
  },
  fontSize: "0.875rem",
  lineHeight: "1.5",
};
export const invalidInputStyle = {
  ...validInputStyle,
  outline: "1px solid #ef4444",
  color: "#7F1D1D",
};
export const labelStyle = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: "500",
  lineHeight: "1.5",
  color: "#1a202c",
};
export const descriptionStyle = {
  marginTop: "0.3rem",
  fontSize: "0.875rem",
  color: "#7F1D1D",
};

export const buttonStyle = {
  marginTop: "1rem",
  display: "flex",
  paddingTop: "0.375rem",
  paddingBottom: "0.375rem",
  paddingLeft: "0.75rem",
  paddingRight: "0.75rem",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  fontWeight: "600",
  lineHeight: "1.5rem",
  justifyContent: "center",
  width: "100%",
  borderRadius: "0.375rem",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  backgroundColor: "#2563EB",
  color: "#ffffff",
  // ":hover": {
  //   backgroundColor: "#3B82F6",
  // },
};

export const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#FFFFFF",
  color: "#111827",
  marginTop: "0.5rem",
};
