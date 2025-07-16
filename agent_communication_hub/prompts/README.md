# Agent Prompts

This directory contains the system prompts that each AI agent needs to understand their role in the multi-agent development system.

## 📋 Available Prompts

### technical_lead_prompt.md
**For: VS Code Agent (Technical Lead)**
- Coordinates between human and other agents
- Creates structured task assignments
- Monitors progress and provides support
- Enforces quality standards

### warp_agent_prompt.md  
**For: Warp Terminal Agent**
- Executes development tasks
- Monitors instructions.md for assignments
- Follows coding standards strictly
- Reports progress and asks questions

## 🚀 How to Use

### For Technical Lead (VS Code):
1. Copy the content from `technical_lead_prompt.md`
2. Add it to your VS Code agent's system prompt
3. The agent will then know to:
   - Monitor `human_input.md` for your directions
   - Create tasks in `instructions.md`
   - Coordinate with other agents

### For Warp Agent:
1. Copy the content from `warp_agent_prompt.md`
2. Add it to your Warp agent's system prompt
3. The agent will then know to:
   - Monitor `instructions.md` for tasks
   - Execute tasks following standards
   - Update status and progress files

## 🔄 Workflow Overview

```
Human → human_input.md → Technical Lead → instructions.md → Warp Agent
  ↑                                                            ↓
  └── Progress Reports ←── Status Updates ←── Task Execution ←──┘
```

## 📁 Key Files Each Agent Uses

### Technical Lead:
- **Reads**: `human_input.md`, `agent_status.json`, `/planning/`
- **Writes**: `instructions.md`, responses in `human_input.md`

### Warp Agent:
- **Reads**: `instructions.md`, `coding_standards_ref.md`
- **Writes**: `agent_status.json`, `agents/warp_agent/` files

## 🎯 Entry Points

### For Human (You):
Write your instructions in: `agent_communication_hub/human_input.md`

### For Technical Lead:
Monitor: `agent_communication_hub/human_input.md`
Output: `agent_communication_hub/instructions.md`

### For Warp Agent:
Monitor: `agent_communication_hub/instructions.md`
Use simple polling script: `python simple_monitor.py`

## 🔧 Simple Monitoring

Instead of complex monitoring systems, agents use simple file polling:

```python
# Warp agent runs this
python agent_communication_hub/simple_monitor.py
```

This checks `instructions.md` every 10 seconds (waiting) or 60 seconds (working).

## 📝 Communication Format

### Human to Technical Lead:
Plain English instructions in `human_input.md`

### Technical Lead to Agents:
Structured JSON tasks in `instructions.md`:

```json
{
  "task_id": "auth_setup_001",
  "assigned_to": "warp_agent",
  "priority": "high",
  "description": "Implement authentication system",
  "deliverables": ["JWT middleware", "Login API"],
  "coding_standards": "php_laravel_standards"
}
```

### Agents to Technical Lead:
Status updates and questions in `instructions.md` communication section.

---

**Next Steps:**
1. Copy the appropriate prompt to each agent
2. Start with human instructions in `human_input.md`
3. Let the Technical Lead create structured tasks
4. Run the simple monitor for other agents
