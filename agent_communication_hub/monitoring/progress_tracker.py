#!/usr/bin/env python3
"""
Progress Tracking System
Monitors agent progress and generates reports
"""

import json
import time
from datetime import datetime, timedelta
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd

class ProgressTracker:
    def __init__(self, hub_path="./agent_communication_hub"):
        self.hub_path = Path(hub_path)
        self.status_file = self.hub_path / "agent_status.json"
        self.tasks_file = self.hub_path / "task_assignments.json"
        self.progress_file = self.hub_path / "progress_log.md"
        
    def get_current_status(self):
        """Get current agent status"""
        try:
            with open(self.status_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading status: {e}")
            return None
    
    def get_task_assignments(self):
        """Get task assignment data"""
        try:
            with open(self.tasks_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading tasks: {e}")
            return None
    
    def calculate_productivity_metrics(self, status_data):
        """Calculate productivity metrics for each agent"""
        metrics = {}
        
        for agent_name, agent_data in status_data['agents'].items():
            last_activity = datetime.fromisoformat(agent_data['last_activity'].replace('Z', '+00:00'))
            time_since_activity = datetime.now() - last_activity.replace(tzinfo=None)
            
            metrics[agent_name] = {
                'tasks_completed_today': agent_data['completed_tasks_today'],
                'total_hours_logged': agent_data['total_hours_logged'],
                'current_status': agent_data['status'],
                'availability': agent_data['availability'],
                'time_since_last_activity': time_since_activity.total_seconds() / 60,  # minutes
                'productivity_score': self._calculate_productivity_score(agent_data)
            }
        
        return metrics
    
    def _calculate_productivity_score(self, agent_data):
        """Calculate a productivity score (0-100)"""
        score = 0
        
        # Base score from completed tasks
        score += min(agent_data['completed_tasks_today'] * 20, 60)
        
        # Bonus for being active
        if agent_data['status'] == 'working':
            score += 20
        elif agent_data['status'] == 'active':
            score += 10
        
        # Penalty for being blocked or waiting too long
        if agent_data['status'] == 'blocked':
            score -= 30
        elif agent_data['status'] == 'waiting':
            score -= 10
        
        # Hours logged bonus
        score += min(agent_data['total_hours_logged'] * 2, 20)
        
        return max(0, min(100, score))
    
    def generate_progress_report(self):
        """Generate comprehensive progress report"""
        status_data = self.get_current_status()
        task_data = self.get_task_assignments()
        
        if not status_data or not task_data:
            return None
        
        metrics = self.calculate_productivity_metrics(status_data)
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'system_status': status_data['system_status'],
            'agent_metrics': metrics,
            'task_summary': {
                'active_tasks': len(task_data['active_tasks']),
                'completed_tasks': len(task_data['completed_tasks']),
                'total_assignments': len(task_data['assignment_history'])
            },
            'recommendations': self._generate_recommendations(metrics, task_data)
        }
        
        return report
    
    def _generate_recommendations(self, metrics, task_data):
        """Generate recommendations based on current status"""
        recommendations = []
        
        # Check for blocked agents
        blocked_agents = [name for name, data in metrics.items() 
                         if data['current_status'] == 'blocked']
        if blocked_agents:
            recommendations.append({
                'type': 'urgent',
                'message': f"Agents blocked: {', '.join(blocked_agents)}. Immediate attention required."
            })
        
        # Check for idle agents
        idle_agents = [name for name, data in metrics.items() 
                      if data['current_status'] == 'waiting' and data['time_since_last_activity'] > 60]
        if idle_agents:
            recommendations.append({
                'type': 'attention',
                'message': f"Agents idle for >1 hour: {', '.join(idle_agents)}. Consider task assignment."
            })
        
        # Check productivity scores
        low_productivity = [name for name, data in metrics.items() 
                           if data['productivity_score'] < 30]
        if low_productivity:
            recommendations.append({
                'type': 'improvement',
                'message': f"Low productivity agents: {', '.join(low_productivity)}. Review task assignments."
            })
        
        # Check task distribution
        active_tasks = len(task_data['active_tasks'])
        working_agents = len([name for name, data in metrics.items() 
                             if data['current_status'] == 'working'])
        
        if active_tasks > working_agents * 2:
            recommendations.append({
                'type': 'workload',
                'message': f"High task-to-agent ratio ({active_tasks}:{working_agents}). Consider load balancing."
            })
        
        return recommendations
    
    def update_progress_log(self, report):
        """Update the progress log markdown file"""
        try:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Read existing log
            if self.progress_file.exists():
                with open(self.progress_file, 'r') as f:
                    content = f.read()
            else:
                content = "# Agent Progress Log\n\n"
            
            # Add new entry
            new_entry = f"""
## Progress Update - {timestamp}

### System Status
- Communication Hub: {'✅ Active' if report['system_status']['communication_hub_active'] else '❌ Inactive'}
- Active Tasks: {report['task_summary']['active_tasks']}
- Completed Tasks: {report['task_summary']['completed_tasks']}

### Agent Status
"""
            
            for agent_name, metrics in report['agent_metrics'].items():
                status_emoji = {
                    'working': '🔄',
                    'active': '✅',
                    'waiting': '⏳',
                    'blocked': '🚨'
                }.get(metrics['current_status'], '❓')
                
                new_entry += f"- **{agent_name.replace('_', ' ').title()}**: {status_emoji} {metrics['current_status']} (Score: {metrics['productivity_score']}/100)\n"
            
            # Add recommendations
            if report['recommendations']:
                new_entry += "\n### Recommendations\n"
                for rec in report['recommendations']:
                    emoji = {'urgent': '🚨', 'attention': '⚠️', 'improvement': '💡', 'workload': '⚖️'}.get(rec['type'], '📝')
                    new_entry += f"- {emoji} {rec['message']}\n"
            
            new_entry += "\n---\n"
            
            # Insert at the beginning of the log section
            if "## Progress Updates" in content:
                content = content.replace("## Progress Updates", f"## Progress Updates{new_entry}")
            else:
                content += f"\n## Progress Updates{new_entry}"
            
            with open(self.progress_file, 'w') as f:
                f.write(content)
                
            return True
        except Exception as e:
            print(f"Error updating progress log: {e}")
            return False
    
    def generate_charts(self, output_dir="./charts"):
        """Generate progress charts"""
        try:
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True)
            
            status_data = self.get_current_status()
            if not status_data:
                return False
            
            metrics = self.calculate_productivity_metrics(status_data)
            
            # Productivity scores chart
            agents = list(metrics.keys())
            scores = [metrics[agent]['productivity_score'] for agent in agents]
            
            plt.figure(figsize=(10, 6))
            bars = plt.bar(agents, scores, color=['#28a745' if s >= 70 else '#ffc107' if s >= 40 else '#dc3545' for s in scores])
            plt.title('Agent Productivity Scores')
            plt.ylabel('Productivity Score (0-100)')
            plt.ylim(0, 100)
            
            # Add value labels on bars
            for bar, score in zip(bars, scores):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                        f'{score}', ha='center', va='bottom')
            
            plt.tight_layout()
            plt.savefig(output_path / 'productivity_scores.png', dpi=300, bbox_inches='tight')
            plt.close()
            
            # Task completion chart
            completed_tasks = [metrics[agent]['tasks_completed_today'] for agent in agents]
            
            plt.figure(figsize=(10, 6))
            plt.bar(agents, completed_tasks, color='#007bff')
            plt.title('Tasks Completed Today')
            plt.ylabel('Number of Tasks')
            
            for i, tasks in enumerate(completed_tasks):
                plt.text(i, tasks + 0.1, str(tasks), ha='center', va='bottom')
            
            plt.tight_layout()
            plt.savefig(output_path / 'task_completion.png', dpi=300, bbox_inches='tight')
            plt.close()
            
            return True
        except Exception as e:
            print(f"Error generating charts: {e}")
            return False
    
    def run_monitoring_loop(self, interval=300):  # 5 minutes
        """Run continuous monitoring loop"""
        print("Starting progress monitoring...")
        
        while True:
            try:
                report = self.generate_progress_report()
                if report:
                    self.update_progress_log(report)
                    
                    # Generate charts every hour
                    if datetime.now().minute == 0:
                        self.generate_charts()
                    
                    # Print urgent recommendations
                    urgent_recs = [r for r in report['recommendations'] if r['type'] == 'urgent']
                    for rec in urgent_recs:
                        print(f"🚨 URGENT: {rec['message']}")
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\nStopping progress monitoring...")
                break
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                time.sleep(interval)

def main():
    tracker = ProgressTracker()
    
    # Generate initial report
    report = tracker.generate_progress_report()
    if report:
        print("Progress Report Generated:")
        print(json.dumps(report, indent=2))
        
        tracker.update_progress_log(report)
        tracker.generate_charts()
    
    # Start monitoring loop
    # tracker.run_monitoring_loop()

if __name__ == "__main__":
    main()
