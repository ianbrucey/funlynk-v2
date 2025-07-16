#!/usr/bin/env python3
"""
Simple Agent Monitor - Polls instructions.md for tasks
Much simpler version for same-computer agents
"""

import time
import json
import re
from pathlib import Path
from datetime import datetime

def simple_agent_monitor(agent_name="warp_agent", working_interval=60, waiting_interval=10):
    """
    Simple file polling monitor for agents
    
    Args:
        agent_name: Name of this agent
        working_interval: Polling interval when working on a task (seconds) - less frequent
        waiting_interval: Polling interval when waiting for tasks (seconds) - more frequent
    """
    
    instructions_file = Path("agent_communication_hub/instructions.md")
    status_file = Path("agent_communication_hub/agent_status.json")
    
    current_task = None
    last_modified = 0
    
    print(f"🤖 {agent_name} starting simple monitor...")
    print(f"📁 Watching: {instructions_file}")
    print(f"⏱️  Intervals: {waiting_interval}s (waiting) / {working_interval}s (working)")
    
    while True:
        try:
            # Check if instructions file was modified
            if instructions_file.exists():
                modified = instructions_file.stat().st_mtime
                
                if modified > last_modified:
                    last_modified = modified
                    print(f"📝 Instructions updated at {datetime.now().strftime('%H:%M:%S')}")
                    
                    # Read and parse instructions
                    with open(instructions_file, 'r') as f:
                        content = f.read()
                    
                    # Look for tasks assigned to this agent
                    my_tasks = find_my_tasks(content, agent_name)
                    
                    if my_tasks:
                        for task in my_tasks:
                            if task['task_id'] != current_task:
                                print(f"🎯 New task assigned: {task['task_id']}")
                                print(f"📋 Description: {task['description']}")
                                
                                current_task = task['task_id']
                                update_my_status(status_file, agent_name, 'working', current_task)
                                
                                # Here you would call your task execution logic
                                # execute_task(task)
                    
                    # Check for completion signals, questions, etc.
                    check_communication_signals(content)
            
            # Use different polling intervals based on current state
            interval = working_interval if current_task else waiting_interval
            time.sleep(interval)
            
        except KeyboardInterrupt:
            print(f"\n👋 {agent_name} monitor stopped")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            time.sleep(waiting_interval)

def find_my_tasks(content, agent_name):
    """Extract tasks assigned to this agent from instructions content"""
    tasks = []
    
    # Find JSON blocks
    json_pattern = r'```json\s*(\{[\s\S]*?\})\s*```'
    
    for match in re.finditer(json_pattern, content):
        try:
            task_data = json.loads(match.group(1))
            if (task_data.get('assigned_to') == agent_name and 
                'task_id' in task_data):
                tasks.append(task_data)
        except json.JSONDecodeError:
            continue
    
    return tasks

def update_my_status(status_file, agent_name, status, current_task=None):
    """Update this agent's status in the status file"""
    try:
        with open(status_file, 'r') as f:
            data = json.load(f)
        
        if agent_name in data['agents']:
            data['agents'][agent_name]['status'] = status
            data['agents'][agent_name]['current_task'] = current_task
            data['agents'][agent_name]['last_activity'] = datetime.now().isoformat()
        
        data['last_updated'] = datetime.now().isoformat()
        
        with open(status_file, 'w') as f:
            json.dump(data, f, indent=2)
            
        print(f"✅ Status updated: {status}")
        
    except Exception as e:
        print(f"❌ Error updating status: {e}")

def check_communication_signals(content):
    """Check for communication signals in instructions"""
    if '(URGENT)' in content:
        print("🚨 URGENT message detected!")
    elif '(QUESTION)' in content:
        print("❓ Question needs response")
    elif '(BLOCKED)' in content:
        print("🚫 Someone is blocked")

if __name__ == "__main__":
    # Example usage
    simple_agent_monitor(
        agent_name="warp_agent",
        working_interval=60,    # Check every 60 seconds when working (less frequent)
        waiting_interval=10     # Check every 10 seconds when waiting (more frequent)
    )
