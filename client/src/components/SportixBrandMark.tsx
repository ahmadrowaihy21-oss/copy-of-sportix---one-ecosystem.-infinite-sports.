import React from "react";
import "../sportix-brand-mark.css";

type SportixBrandMarkProps = {
  alt?: string;
  className?: string;
};

export default function SportixBrandMark({ alt = "SPORTIX", className = "" }: SportixBrandMarkProps) {
  return <strong className={`sportix-wordmark-fallback ${className}`.trim()} role="img" aria-label={alt}>SPORTIX</strong>;
}
