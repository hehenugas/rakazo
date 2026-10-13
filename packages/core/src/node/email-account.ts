import { createHash } from "node:crypto";

/** Opaque snapshot of the provider account reference bound to an approved email draft. */
export function emailAccountSnapshot(providerRef: string | null | undefined): string {
  return createHash("sha256")
    .update(providerRef ?? "")
    .digest("hex");
}
