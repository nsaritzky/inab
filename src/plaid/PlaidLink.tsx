import { PlaidLinkPropTypes } from "./types";
import { createPlaidLink } from "./createPlaidLink";
import { Component } from "solid-js";

export const PlaidLink: Component<PlaidLinkPropTypes> = (props) => {
  const { children, style, className, ...config } = props;
  const { error, open } = createPlaidLink({ ...config });

  return (
    <button
      disabled={Boolean(error)}
      type="button"
      class={className}
      style={{
        padding: "6px 4px",
        outline: "none",
        background: "#FFFFFF",
        border: "2px solid #F1F1F1",
        borderRadius: "4px",
        ...style,
      }}
      onClick={() => open()}
    >
      {children}
    </button>
  );
};
