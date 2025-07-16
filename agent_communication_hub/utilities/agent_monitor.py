#!/usr/bin/env python3
"""
Agent Monitoring Utility
Monitors instructions.md for changes and task assignments
"""

import json
import time
import os
import re
from datetime import datetime
from pathlib import Path

class AgentMonitor:
    def __init__(self, hub_path="./agent_communication_hub", agent_name="warp_agent"):
        self.hub_path = Path(hub_path)
        self.agent_name = agent_name
        self.instructions_file = self.hub_path / "instructions.md"
        self.status_file = self.hub_path / "agent_status.json"
        self.tasks_file = self.hub_path / "task_assignments.json"
        self.agent_dir = self.hub_path / "agents" / agent_name
        
        self.last_modified = 0
        self.current_task = None
        
    def parse_instructions(self):
        """Parse instructions.md for tasks and delimiters"""
        try:
            with open(self.instructions_file, 'r') as f:
                content = f.read()
                
            return {
                'tasks': self._extract_tasks(content),
                'delimiters': self._extract_delimiters(content),
                'last_update': self._get_last_update(content),
                'status': self._get_communication_status(content)
            }
        except Exception as e:
            print(f"Error parsing instructions: {e}")
            return None
    
    def _extract_tasks(self, content):
        """Extract JSON task objects from markdown"""
        tasks = []
        json_pattern = r'```json\s*(\{[\s\S]*?\})\s*```'
        
        for match in re.finditer(json_pattern, content):
            try:
                task_data = json.loads(match.group(1))
                if 'task_id' in task_data and 'assigned_to' in task_data:
                    tasks.append(task_data)
            except json.JSONDecodeError as e:
                print(f"Invalid JSON in task assignment: {e}")
                
        return tasks
    
    def _extract_delimiters(self, content):
        """Extract communication delimiters"""
        delimiters = []
        delimiter_pattern = r'\((TASK_ASSIGNED|COMMUNICATION_OVER|URGENT|QUESTION|BLOCKED)\)'
        
        for match in re.finditer(delimiter_pattern, content):
            delimiters.append({
                'type': match.group(1),
                'position': match.start(),
                'timestamp': datetime.now().isoformat()
            })
            
        return delimiters
    
    def _get_last_update(self, content):
        """Get last update timestamp"""
        update_match = re.search(r'\*\*Last Updated\*\*:\s*([^\n]+)', content)
        return update_match.group(1).strip() if update_match else None
    
    def _get_communication_status(self, content):
        """Determine communication status"""
        if '(COMMUNICATION_OVER)' in content:
            return 'complete'
        elif '(TASK_ASSIGNED)' in content:
            return 'task_assigned'
        elif '(URGENT)' in content:
            return 'urgent'
        elif '(QUESTION)' in content:
            return 'question_pending'
        elif '(BLOCKED)' in content:
            return 'blocked'
        return 'active'
    
    def update_status(self, status, current_task=None):
        """Update agent status in status file"""
        try:
            with open(self.status_file, 'r') as f:
                status_data = json.load(f)
            
            if self.agent_name in status_data['agents']:
                agent_status = status_data['agents'][self.agent_name]
                agent_status['status'] = status
                agent_status['current_task'] = current_task
                agent_status['last_activity'] = datetime.now().isoformat()
                
                if status == 'completed_task':
                    agent_status['completed_tasks_today'] += 1
            
            status_data['last_updated'] = datetime.now().isoformat()
            
            with open(self.status_file, 'w') as f:
                json.dump(status_data, f, indent=2)
                
            return True
        except Exception as e:
            print(f"Error updating status: {e}")
            return False
    
    def update_current_focus(self, task_data):
        """Update agent's current focus file"""
        try:
            focus_file = self.agent_dir / "current_focus.md"
            
            content = f"""# {self.agent_name.replace('_', ' ').title()} - Current Focus
**Agent**: {self.agent_name.replace('_', ' ').title()}  
**Last Updated**: {datetime.now().strftime('%Y-%m-%d')}  
**Status**: Working  

## 🎯 Current Task
**Task ID**: {task_data.get('task_id', 'N/A')}  
**Priority**: {task_data.get('priority', 'medium')}  
**Started**: {datetime.now().strftime('%Y-%m-%d')}  
**Estimated Completion**: {task_data.get('estimated_hours', 'TBD')}  

### Description
{task_data.get('description', 'No description provided')}

### Deliverables
{chr(10).join(f'- {item}' for item in task_data.get('deliverables', []))}

### Progress
- 🔄 Task started
- ⏳ In progress

### Coding Standards Reference
{task_data.get('coding_standards', 'general_standards')}

## 📋 Dependencies
{chr(10).join(f'- {dep}' for dep in task_data.get('dependencies', []))}

## 🤝 Context
{task_data.get('context', 'No additional context provided')}
"""
            
            with open(focus_file, 'w') as f:
                f.write(content)
                
            return True
        except Exception as e:
            print(f"Error updating current focus: {e}")
            return False
    
    def check_for_my_tasks(self, parsed_data):
        """Check if any tasks are assigned to this agent"""
        my_tasks = []
        
        for task in parsed_data.get('tasks', []):
            if task.get('assigned_to') == self.agent_name:
                my_tasks.append(task)
        
        return my_tasks
    
    def monitor(self, callback=None):
        """Main monitoring loop"""
        print(f"Starting monitor for {self.agent_name}")
        print(f"Watching: {self.instructions_file}")
        
        while True:
            try:
                # Check if instructions file was modified
                if self.instructions_file.exists():
                    modified = self.instructions_file.stat().st_mtime
                    
                    if modified > self.last_modified:
                        self.last_modified = modified
                        print(f"Instructions updated at {datetime.now()}")
                        
                        parsed = self.parse_instructions()
                        if parsed:
                            # Check for tasks assigned to this agent
                            my_tasks = self.check_for_my_tasks(parsed)
                            
                            if my_tasks:
                                print(f"Found {len(my_tasks)} task(s) assigned to {self.agent_name}")
                                
                                for task in my_tasks:
                                    print(f"Processing task: {task['task_id']}")
                                    self.update_status('working', task['task_id'])
                                    self.update_current_focus(task)
                                    
                                    if callback:
                                        callback(task)
                            
                            # Handle communication status
                            status = parsed.get('status')
                            if status == 'urgent':
                                print("URGENT message detected!")
                            elif status == 'question_pending':
                                print("Question pending response")
                
                time.sleep(30)  # Check every 30 seconds
                
            except KeyboardInterrupt:
                print(f"\nStopping monitor for {self.agent_name}")
                break
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                time.sleep(30)

def main():
    """Example usage"""
    monitor = AgentMonitor(agent_name="warp_agent")
    
    def task_callback(task_data):
        print(f"Received task: {task_data['task_id']}")
        print(f"Description: {task_data['description']}")
        # Here you would implement the actual task execution logic
    
    monitor.monitor(callback=task_callback)

if __name__ == "__main__":
    main()
