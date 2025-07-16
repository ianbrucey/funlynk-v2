# Multi-Agent Communication Hub

A robust file-based communication system for coordinating multiple AI agents in software development projects.

## 🎯 Overview

This system enables seamless coordination between a Technical Lead agent (VS Code) and other development agents (Warp, etc.) through structured file-based communication, ensuring consistent coding standards and efficient task management.

## 📁 Directory Structure

```
agent_communication_hub/
├── instructions.md              # Main communication file
├── agent_status.json           # Real-time agent status
├── task_assignments.json       # Structured task data
├── coding_standards_ref.md     # Quick standards reference
├── progress_log.md            # Historical progress tracking
├── agents/                    # Agent-specific folders
│   ├── technical_lead/
│   └── warp_agent/
├── utilities/                 # Parsing and monitoring tools
├── monitoring/               # Status dashboard and alerts
├── standards_enforcement/    # Quality gates and checklists
└── examples/                # Sample workflows and tests
```

## 🚀 Quick Start

### For Technical Lead (VS Code Agent)

1. **Assign Tasks**: Update `instructions.md` with structured task assignments
2. **Use Delimiters**: Mark assignments with `(TASK_ASSIGNED)` and end with `(COMMUNICATION_OVER)`
3. **Monitor Progress**: Check agent status files and dashboard
4. **Respond to Questions**: Answer agent questions in the communication section

### For Warp Agent

1. **Start Monitoring**: Run `python utilities/agent_monitor.py`
2. **Process Tasks**: System automatically detects and processes assignments
3. **Update Status**: Status files are updated automatically
4. **Ask Questions**: Post questions in instructions.md with `(QUESTION)` delimiter

## 📋 Task Assignment Format

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

## 🔧 Communication Delimiters

- `(TASK_ASSIGNED)` - New task has been assigned
- `(COMMUNICATION_OVER)` - End of current instruction set
- `(URGENT)` - Immediate attention required
- `(QUESTION)` - Response needed from specific agent
- `(BLOCKED)` - Task is blocked, need assistance
- `(TASK_COMPLETE)` - Task has been completed

## 📊 Monitoring & Status

### Real-time Dashboard
Open `monitoring/status_dashboard.html` in your browser for live agent status.

### Status Tracking
- Agent availability and current tasks
- Task completion metrics
- System health monitoring
- Progress visualization

### Alerts
Run `python monitoring/alert_system.py` for automated alerts on:
- Blocked agents
- Idle agents (>60 minutes)
- System issues
- Urgent messages

## 🛡️ Standards Enforcement

### Pre-Task Checklist
All agents must complete `standards_enforcement/pre_task_checklist.md` before starting tasks.

### Quality Gates
Automated checks defined in `standards_enforcement/quality_gates.json`:
- Code style compliance (PSR-12, ESLint)
- Test coverage (80% minimum)
- Documentation requirements
- Security standards

### Code Review
Use `standards_enforcement/code_review_template.md` for consistent reviews.

## 🔗 Integration with Existing Planning

The system integrates with your existing planning structure:
- **Coding Standards**: `/planning/01_coding_standards_and_style_guide.md`
- **Execution Tasks**: `/planning/execution-tasks/`
- **Design System**: `/planning/design-system/`
- **API Contracts**: `/planning/02_api_contract_definition.md`

## 🧪 Testing

### Run Test Workflow
```bash
cd agent_communication_hub/examples
python test_workflow.py
```

This simulates a complete task assignment and completion cycle.

### Example Workflow
See `examples/sample_task_assignment.md` for a detailed example of the communication flow.

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# For Python utilities
pip install matplotlib pandas

# For Node.js utilities  
npm install
```

### 2. Configure Alerts (Optional)
Edit `monitoring/alert_config.json` to set up email notifications.

### 3. Start Monitoring
```bash
# For Warp Agent
python utilities/agent_monitor.py

# For Progress Tracking
python monitoring/progress_tracker.py

# For Alerts
python monitoring/alert_system.py
```

## 📈 Key Benefits

1. **Simple & Trackable**: File-based communication that's easy to debug
2. **Standards Enforced**: Built-in coding standards compliance
3. **Real-time Status**: Live monitoring of all agents
4. **Question Handling**: Clear mechanism for agent communication
5. **Progress Tracking**: Historical logs and metrics
6. **Scalable**: Easy to add more agents
7. **Human Oversight**: Simple enough for human monitoring

## 🔄 Workflow Example

1. **Human** provides direction to Technical Lead
2. **Technical Lead** creates structured task assignments
3. **Agents** monitor and automatically process assignments
4. **System** tracks progress and enforces standards
5. **Agents** communicate questions and status updates
6. **Technical Lead** provides guidance and reviews
7. **System** logs completion and metrics

## 📞 Support

For issues or questions:
1. Check the examples directory for usage patterns
2. Review the utilities README for technical details
3. Monitor the progress logs for system status
4. Use the alert system for critical issues

---

**Built for Funlynk V2 Multi-Agent Development**  
**Version**: 1.0  
**Last Updated**: 2025-01-16
