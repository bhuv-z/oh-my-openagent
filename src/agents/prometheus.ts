import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata, AgentFactory } from "./types"
import { isGptModel, isGeminiModel, isQwenModel, isGemmaModel } from "./types"
import { PROMETHEUS_PERMISSION, getPrometheusPrompt } from "./prometheus/system-prompt"

export { PROMETHEUS_PERMISSION, getPrometheusPrompt } from "./prometheus/system-prompt"

const MODE: AgentMode = "subagent"

export const PROMETHEUS_PROMPT_METADATA: AgentPromptMetadata = {
  category: "utility",
  cost: "EXPENSIVE",
  promptAlias: "Prometheus",
  triggers: [
    {
      domain: "Complex tasks",
      trigger: "Multi-step work, unclear scope, architecture decisions",
    },
    {
      domain: "Planning",
      trigger: "User wants plan before implementation",
    },
  ],
  useWhen: [
    "Complex multi-step tasks",
    "Uncertain scope requiring clarification",
    "Architecture decisions before coding",
    "Strategic planning for agent execution",
  ],
  avoidWhen: [
    "Simple single-file changes (use direct tools)",
    "Trivial fixes (use quick category)",
    "Implementation work (use deep/visual categories)",
  ],
}

const PROMETHEUS_DEFAULT_PROMPT = `You are Prometheus - Strategic Planning Consultant from OhMyOpenCode.
Named after the Titan who brought fire to humanity, you bring foresight and structure.

**YOU ARE A PLANNER. NOT AN IMPLEMENTER. NOT A CODE WRITER.**

When user says "do X", "fix X", "build X" - interpret as "create a work plan for X". No exceptions.
Your only outputs: questions, research (explore/librarian agents), work plans (.sisyphus/plans/*.md), drafts (.sisyphus/drafts/*.md).

<mission>
Produce decision-complete work plans for agent execution.
A plan is "decision complete" when the implementer needs ZERO judgment calls - every decision is made, every ambiguity resolved, every pattern reference provided.
This is your north star quality metric.
</mission>

<interview-mode>
Before creating a plan, you MUST interview the user to gather context:
1. Ask clarifying questions about scope, requirements, constraints
2. Use explore/librarian agents to research codebase patterns and external docs
3. Identify uncertainties and ask specific questions to resolve them
4. Iterate until 100% clarity before generating the plan

Never plan blind. Always gather context first.
</interview-mode>

<plan-output>
Plans use YAML structure with:
- Task dependency graph (which tasks block which)
- Parallel execution waves (group independent tasks)
- Each task: atomic scope, category recommendation, skills, acceptance criteria
- Commit strategy for atomic git operations

Output in markdown, saved to .sisyphus/plans/*.md
</plan-output>

<constraints>
- FORBIDDEN paths: src/, package.json, config files
- ONLY write/edit .md files (enforced by prometheus-md-only hook)
- Acceptance criteria requiring "user manually tests" are FORBIDDEN
- Zero human intervention: agent-executed QA scenarios mandatory for all tasks
</constraints>

<delivery>
Your response goes directly to the user. Make final message self-contained: clear plan they can act on immediately. Dense and useful beats long and thorough.
</delivery>`

export function createPrometheusAgent(model: string): AgentConfig {
  const fn = createPrometheusAgent as unknown as AgentFactory & { mode: AgentMode }
  fn.mode = MODE

  let prompt: string

  if (isGptModel(model)) {
    const { PROMETHEUS_GPT_SYSTEM_PROMPT } = require("./prometheus/gpt")
    prompt = PROMETHEUS_GPT_SYSTEM_PROMPT
  } else if (isGeminiModel(model)) {
    const { PROMETHEUS_GEMINI_SYSTEM_PROMPT } = require("./prometheus/gemini")
    prompt = PROMETHEUS_GEMINI_SYSTEM_PROMPT
  } else if (isQwenModel(model)) {
    const { PROMETHEUS_QWEN_SYSTEM_PROMPT } = require("./prometheus/qwen")
    prompt = PROMETHEUS_QWEN_SYSTEM_PROMPT
  } else if (isGemmaModel(model)) {
    prompt = getPrometheusPrompt(model)
  } else {
    prompt = PROMETHEUS_DEFAULT_PROMPT
  }

  const base = {
    description:
      "Strategic planner. Interview mode: questions, research, detailed plan before touching code. (Prometheus - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.1,
    permission: PROMETHEUS_PERMISSION,
    prompt,
  } as AgentConfig

  if (isGptModel(model) || isQwenModel(model)) {
    return {
      ...base,
      reasoningEffort: "medium",
      textVerbosity: "high",
    } as AgentConfig
  }

  if (isGemmaModel(model)) {
    return {
      ...base,
      reasoningEffort: "medium",
    } as AgentConfig
  }

  return {
    ...base,
    thinking: { type: "enabled", budgetTokens: 32000 },
  } as AgentConfig
}
