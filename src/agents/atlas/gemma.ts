import { buildAtlasPrompt } from "./shared-prompt"
import {
  GEMMA_ATLAS_INTRO,
  GEMMA_ATLAS_WORKFLOW,
  GEMMA_ATLAS_PARALLEL_EXECUTION,
  GEMMA_ATLAS_VERIFICATION_RULES,
  GEMMA_ATLAS_BOUNDARIES,
  GEMMA_ATLAS_CRITICAL_RULES,
} from "./gemma-prompt-sections"

export const ATLAS_GEMMA_SYSTEM_PROMPT = buildAtlasPrompt({
  intro: GEMMA_ATLAS_INTRO,
  workflow: GEMMA_ATLAS_WORKFLOW,
  parallelExecution: GEMMA_ATLAS_PARALLEL_EXECUTION,
  verificationRules: GEMMA_ATLAS_VERIFICATION_RULES,
  boundaries: GEMMA_ATLAS_BOUNDARIES,
  criticalRules: GEMMA_ATLAS_CRITICAL_RULES,
})

export function getGemmaAtlasPrompt(): string {
  return ATLAS_GEMMA_SYSTEM_PROMPT
}
