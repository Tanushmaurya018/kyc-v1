import type { ContractStatus } from "@/types";

/**
 * Backend session states (from face-sign Rust backend) — UPPERCASE.
 */
export type BackendSessionState =
  | "CREATED"
  | "HANDSHAKED"
  | "PREVIEWING"
  | "KYC_PENDING"
  | "KYC_SUCCESS"
  | "KYC_FAILED"
  | "KYC_EXPIRED"
  | "POSITIONING"
  | "SIGNING"
  | "COMPLETE"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

const stateMap: Record<BackendSessionState, ContractStatus> = {
  CREATED: "CREATED",
  HANDSHAKED: "CREATED",
  PREVIEWING: "CREATED",
  KYC_PENDING: "CREATED",
  KYC_SUCCESS: "CREATED",
  POSITIONING: "CREATED",
  SIGNING: "CREATED",
  COMPLETE: "SIGNED",
  KYC_FAILED: "REJECTED",
  FAILED: "REJECTED",
  EXPIRED: "EXPIRED",
  KYC_EXPIRED: "EXPIRED",
  CANCELLED: "ABANDONED",
};

export function mapSessionState(state: string): ContractStatus {
  return stateMap[state as BackendSessionState] ?? "CREATED";
}

/** Reverse: get all backend states that map to a given dashboard status */
export function getBackendStatesForStatus(
  status: ContractStatus
): BackendSessionState[] {
  return Object.entries(stateMap)
    .filter(([, v]) => v === status)
    .map(([k]) => k as BackendSessionState);
}
