"use client";

import type { ReactNode } from "react";
import { Web3Gate } from "./web3-gate";
import { Web3GateBody } from "./web3-gate-body";

export function Web3GateShell({ children }: { children: ReactNode }) {
  return (
    <Web3Gate>
      <Web3GateBody>{children}</Web3GateBody>
    </Web3Gate>
  );
}
