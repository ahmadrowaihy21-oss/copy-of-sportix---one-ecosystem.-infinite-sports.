import React from "react";
import "../sportix-brand-mark.css";

type SportixBrandMarkProps = {
  alt?: string;
  className?: string;
};

export default function SportixBrandMark({ alt = "SPORTIX", className = "" }: SportixBrandMarkProps) {
  return <span className={`sportix-brand-mark ${className}`.trim()}>
    <img src="/manus-storage/sportix-official-logo_e33eff89.png" alt={alt} decoding="async" />
  </span>;
}
