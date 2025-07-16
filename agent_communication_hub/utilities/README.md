# Agent Communication Utilities

## Overview
This directory contains utilities for parsing task assignments, monitoring instructions, and managing agent communication in the multi-agent development system.

## Files

### task_parser.js (Node.js)
JavaScript utility for parsing instructions.md and managing task assignments.

**Usage:**
```javascript
const TaskParser = require('./task_parser');
const parser = new TaskParser('./agent_communication_hub');

// Parse current instructions
const parsed = parser.parseInstructions();
console.log(parsed.tasks);

// Monitor for changes
parser.monitorInstructions((data) => {
  console.log('Instructions updated:', data);
});

// Update agent status
parser.updateAgentStatus('warp_agent', 'working', 'task_001');
```

### agent_monitor.py (Python)
Python utility for agent monitoring and task processing.

**Usage:**
```python
from agent_monitor import AgentMonitor

# Create monitor for specific agent
monitor = AgentMonitor(agent_name="warp_agent")

# Define task callback
def handle_task(task_data):
    print(f"Processing: {task_data['task_id']}")
    # Implement task logic here

# Start monitoring
monitor.monitor(callback=handle_task)
```

## Integration Instructions

### For Technical Lead (VS Code Agent)
1. Use `task_parser.js` to create and assign tasks
2. Update `instructions.md` with task assignments
3. Monitor agent status through `agent_status.json`

### For Warp Agent
1. Run `agent_monitor.py` to monitor for tasks
2. Implement task execution logic in callback function
3. Update status and progress files automatically

### For Additional Agents
1. Copy and modify `agent_monitor.py` for your agent name
2. Create agent-specific folder in `/agents/`
3. Follow same monitoring pattern

## Task Assignment Format

```json
{
  "task_id": "unique_identifier",
  "assigned_to": "agent_name",
  "priority": "high|medium|low",
  "estimated_hours": "X-Y",
  "dependencies": ["task_id_1"],
  "description": "Clear task description",
  "deliverables": ["item1", "item2"],
  "coding_standards": "reference_section",
  "context": "Additional context"
}
```

## Communication Delimiters

- `(TASK_ASSIGNED)` - New task assigned
- `(COMMUNICATION_OVER)` - End of instruction set
- `(URGENT)` - Immediate attention required
- `(QUESTION)` - Response needed
- `(BLOCKED)` - Task blocked, need help

## Monitoring Frequency
- Agents check `instructions.md` every 30 seconds
- Status updates are real-time
- Progress logs are updated on task completion

## Error Handling
- Invalid JSON tasks are logged but ignored
- File access errors are logged and retried
- Agent status defaults to 'waiting' on errors
