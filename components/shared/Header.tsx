import React from "react";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <h2 className="h2-bold text-primary">{title}</h2>
      {subtitle && <p className="p-16-regular mt-4">{subtitle}</p>}
    </>
  );
}
