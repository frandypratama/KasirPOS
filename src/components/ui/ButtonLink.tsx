import { LinkProps } from "next/dist/client/app-dir/link";
import { NextComponentType } from "next/dist/types";
import Link from "next/link";
import React from "react";

interface ButtonProps extends LinkProps {
  className?: string; 
  children: React.ReactNode;
}

function ButtonLink({ className, children,  ...props }: ButtonProps) {
  return (
    <>
      <Link className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${className && className }`}  {...props} >
        {children}
      </Link>
    </>
  );
}

export default ButtonLink;
