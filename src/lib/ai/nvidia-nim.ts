/**
 * Server-Side NVIDIA NIM Client / Service Wrapper
 * Re-exports NvidiaNimProvider from services/ai for unified access.
 *
 * DO NOT import or execute in browser / client-side components.
 */

export { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";
export type { NvidiaNimCompletionOptions, NvidiaNimMessage } from "@/services/ai/nvidia-nim-provider";
