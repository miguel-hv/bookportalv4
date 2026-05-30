# Skill Registry — bookportalv4

**Generated**: 2026-05-27
**Mode**: engram

## Project Context

- **Tech stack**: Java (Spring Boot), PostgreSQL, Next.js (Tailwind CSS), Docker
- **Status**: Greenfield (no code yet)
- **Architecture**: Planned — Hexagonal / Clean Architecture
- **Testing**: No test infrastructure yet

---

## User Skills (global)

| Skill | Trigger | Path |
|-------|---------|------|
| branch-pr | Creating a pull request, opening a PR, or preparing changes for review | `~/.config/opencode/skills/branch-pr/SKILL.md` |
| go-testing | Writing Go tests, using teatest, or adding test coverage | `~/.config/opencode/skills/go-testing/SKILL.md` |
| issue-creation | Creating a GitHub issue, reporting a bug, or requesting a feature | `~/.config/opencode/skills/issue-creation/SKILL.md` |
| judgment-day | "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | `~/.config/opencode/skills/judgment-day/SKILL.md` |
| skill-creator | Creating a new skill, add agent instructions, or document patterns for AI | `~/.config/opencode/skills/skill-creator/SKILL.md` |

## Project Skills

*(none detected — no project-level skill directories found)*

## Compact Rules

### Project Standards

```
- Language: Java (Spring Boot), TypeScript (Next.js), SQL (PostgreSQL)
- No existing code conventions yet — this is a greenfield project
```

### branch-pr
```
- Every PR MUST link an approved issue
- Every PR MUST have exactly one type:* label
- Branch naming: ^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$
- Conventional commits: ^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9\._-]+\))?!?: .+
- No "Co-Authored-By" trailers
```

### go-testing
- Table-driven tests for functions
- Bubbletea model testing via Update() directly
- teatest for TUI integration tests
- Golden file testing for visual output
- Test files co-located: `*_test.go` next to source

### issue-creation
- MUST use template (bug_report.yml or feature_request.yml)
- Every issue auto-labeled `status:needs-review`
- Questions go to Discussions, not issues
- Approval required: `status:approved` before PR

### judgment-day
- Parallel blind review via TWO sub-agents
- Verdict synthesis: Confirmed / Suspect / Contradiction
- Theoretical WARNINGs are NOT fixed — reported as INFO
- Max 2 fix iterations before asking user
- MUST reach APPROVED or ESCALATED terminal state

### skill-creator
- Frontmatter: name, description (with Trigger), license (Apache-2.0), metadata.author, metadata.version
- Structure: `skills/{name}/SKILL.md` + optional `assets/` and `references/`
- Critical patterns, Code Examples, Commands, Resources sections
- After creation, register in AGENTS.md

---

## Conventions

*(no project-level convention files found)*

## Agent Instructions

AGENTS.md loaded from `~/.config/opencode/AGENTS.md` (global user config).
Key rules extracted:
- Never add "Co-Authored-By" or AI attribution
- Never build after changes
- Default to short answers
- Match user's language (Rioplatense Spanish for Spanish, natural English for English)
- Senior Architect persona (15+ years, GDE & MVP)
- CONCEPTS > CODE, AI IS A TOOL, SOLID FOUNDATIONS
- Push back when user asks for code without understanding
