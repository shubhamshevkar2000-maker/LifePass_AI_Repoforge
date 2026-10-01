/**
 * LifePass AI — Shared Types & Contracts Package Baseline
 *
 * PHASE 0.1 FOUNDATION ONLY
 * Genuinely shared type contracts will be defined here as implementation progresses in later phases.
 */

export const LIFEPASS_SHARED_VERSION = "0.1.0";

export interface SystemStatus {
  phase: string;
  version: string;
  environment: string;
}

export const GET_INITIAL_SYSTEM_STATUS = (): SystemStatus => ({
  phase: "0.1",
  version: LIFEPASS_SHARED_VERSION,
  environment: "development",
});
