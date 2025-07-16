#!/usr/bin/env python3
"""
Alert System for Multi-Agent Communication
Monitors for critical events and sends notifications
"""

import json
import time
import smtplib
from datetime import datetime, timedelta
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertSystem:
    def __init__(self, hub_path="./agent_communication_hub", config_file="alert_config.json"):
        self.hub_path = Path(hub_path)
        self.config_file = self.hub_path / config_file
        self.status_file = self.hub_path / "agent_status.json"
        self.instructions_file = self.hub_path / "instructions.md"
        
        self.config = self.load_config()
        self.last_check = datetime.now()
        self.alert_history = []
        
    def load_config(self):
        """Load alert configuration"""
        default_config = {
            "email": {
                "enabled": False,
                "smtp_server": "smtp.gmail.com",
                "smtp_port": 587,
                "username": "",
                "password": "",
                "recipients": []
            },
            "thresholds": {
                "agent_idle_minutes": 60,
                "task_overdue_hours": 4,
                "system_down_minutes": 5,
                "productivity_threshold": 30
            },
            "alert_types": {
                "agent_blocked": True,
                "agent_idle": True,
                "task_overdue": True,
                "system_down": True,
                "urgent_message": True,
                "low_productivity": False
            }
        }
        
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                # Merge with defaults
                for key, value in default_config.items():
                    if key not in config:
                        config[key] = value
                return config
            else:
                # Create default config file
                with open(self.config_file, 'w') as f:
                    json.dump(default_config, f, indent=2)
                return default_config
        except Exception as e:
            print(f"Error loading config: {e}")
            return default_config
    
    def check_agent_status(self):
        """Check for agent-related alerts"""
        alerts = []
        
        try:
            with open(self.status_file, 'r') as f:
                status_data = json.load(f)
            
            for agent_name, agent_data in status_data['agents'].items():
                last_activity = datetime.fromisoformat(agent_data['last_activity'].replace('Z', '+00:00'))
                time_since_activity = datetime.now() - last_activity.replace(tzinfo=None)
                
                # Check for blocked agents
                if (self.config['alert_types']['agent_blocked'] and 
                    agent_data['status'] == 'blocked'):
                    alerts.append({
                        'type': 'agent_blocked',
                        'severity': 'critical',
                        'agent': agent_name,
                        'message': f"Agent {agent_name} is blocked and needs assistance",
                        'timestamp': datetime.now().isoformat()
                    })
                
                # Check for idle agents
                if (self.config['alert_types']['agent_idle'] and 
                    agent_data['status'] == 'waiting' and
                    time_since_activity.total_seconds() > self.config['thresholds']['agent_idle_minutes'] * 60):
                    alerts.append({
                        'type': 'agent_idle',
                        'severity': 'warning',
                        'agent': agent_name,
                        'message': f"Agent {agent_name} has been idle for {int(time_since_activity.total_seconds() / 60)} minutes",
                        'timestamp': datetime.now().isoformat()
                    })
        
        except Exception as e:
            print(f"Error checking agent status: {e}")
        
        return alerts
    
    def check_system_status(self):
        """Check for system-level alerts"""
        alerts = []
        
        try:
            # Check if communication hub is responsive
            if not self.status_file.exists():
                alerts.append({
                    'type': 'system_down',
                    'severity': 'critical',
                    'message': "Communication hub status file is missing",
                    'timestamp': datetime.now().isoformat()
                })
                return alerts
            
            with open(self.status_file, 'r') as f:
                status_data = json.load(f)
            
            # Check system status
            if not status_data['system_status']['communication_hub_active']:
                alerts.append({
                    'type': 'system_down',
                    'severity': 'critical',
                    'message': "Communication hub is marked as inactive",
                    'timestamp': datetime.now().isoformat()
                })
            
            # Check last update time
            last_update = datetime.fromisoformat(status_data['last_updated'].replace('Z', '+00:00'))
            time_since_update = datetime.now() - last_update.replace(tzinfo=None)
            
            if time_since_update.total_seconds() > self.config['thresholds']['system_down_minutes'] * 60:
                alerts.append({
                    'type': 'system_down',
                    'severity': 'warning',
                    'message': f"System hasn't been updated for {int(time_since_update.total_seconds() / 60)} minutes",
                    'timestamp': datetime.now().isoformat()
                })
        
        except Exception as e:
            alerts.append({
                'type': 'system_down',
                'severity': 'critical',
                'message': f"Error reading system status: {e}",
                'timestamp': datetime.now().isoformat()
            })
        
        return alerts
    
    def check_urgent_messages(self):
        """Check for urgent messages in instructions"""
        alerts = []
        
        try:
            if not self.instructions_file.exists():
                return alerts
            
            with open(self.instructions_file, 'r') as f:
                content = f.read()
            
            if '(URGENT)' in content and self.config['alert_types']['urgent_message']:
                alerts.append({
                    'type': 'urgent_message',
                    'severity': 'high',
                    'message': "Urgent message detected in instructions",
                    'timestamp': datetime.now().isoformat()
                })
            
            if '(BLOCKED)' in content:
                alerts.append({
                    'type': 'agent_blocked',
                    'severity': 'critical',
                    'message': "Agent reported blocked status in instructions",
                    'timestamp': datetime.now().isoformat()
                })
        
        except Exception as e:
            print(f"Error checking urgent messages: {e}")
        
        return alerts
    
    def send_email_alert(self, alert):
        """Send email notification for alert"""
        if not self.config['email']['enabled'] or not self.config['email']['recipients']:
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.config['email']['username']
            msg['To'] = ', '.join(self.config['email']['recipients'])
            msg['Subject'] = f"[{alert['severity'].upper()}] Multi-Agent System Alert"
            
            body = f"""
Alert Details:
- Type: {alert['type']}
- Severity: {alert['severity']}
- Message: {alert['message']}
- Timestamp: {alert['timestamp']}
- Agent: {alert.get('agent', 'System')}

Please check the agent communication hub for more details.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.config['email']['smtp_server'], self.config['email']['smtp_port'])
            server.starttls()
            server.login(self.config['email']['username'], self.config['email']['password'])
            
            text = msg.as_string()
            server.sendmail(self.config['email']['username'], self.config['email']['recipients'], text)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Error sending email alert: {e}")
            return False
    
    def log_alert(self, alert):
        """Log alert to file"""
        try:
            alert_log_file = self.hub_path / "alerts.log"
            
            with open(alert_log_file, 'a') as f:
                f.write(f"{alert['timestamp']} [{alert['severity'].upper()}] {alert['type']}: {alert['message']}\n")
            
            return True
        except Exception as e:
            print(f"Error logging alert: {e}")
            return False
    
    def process_alert(self, alert):
        """Process a single alert"""
        # Avoid duplicate alerts
        alert_key = f"{alert['type']}_{alert.get('agent', 'system')}"
        recent_alerts = [a for a in self.alert_history if 
                        (datetime.now() - datetime.fromisoformat(a['timestamp'])).total_seconds() < 300]  # 5 minutes
        
        if any(a.get('key') == alert_key for a in recent_alerts):
            return  # Skip duplicate
        
        alert['key'] = alert_key
        self.alert_history.append(alert)
        
        # Keep only recent alerts in memory
        self.alert_history = self.alert_history[-100:]
        
        # Log alert
        self.log_alert(alert)
        
        # Print to console
        severity_emoji = {
            'critical': '🚨',
            'high': '⚠️',
            'warning': '⚠️',
            'info': 'ℹ️'
        }
        
        print(f"{severity_emoji.get(alert['severity'], '📢')} {alert['message']}")
        
        # Send email for critical and high severity alerts
        if alert['severity'] in ['critical', 'high']:
            self.send_email_alert(alert)
    
    def run_monitoring_cycle(self):
        """Run one monitoring cycle"""
        all_alerts = []
        
        # Check different alert types
        all_alerts.extend(self.check_agent_status())
        all_alerts.extend(self.check_system_status())
        all_alerts.extend(self.check_urgent_messages())
        
        # Process each alert
        for alert in all_alerts:
            self.process_alert(alert)
        
        return len(all_alerts)
    
    def run_monitoring_loop(self, interval=60):  # 1 minute
        """Run continuous monitoring loop"""
        print("Starting alert monitoring...")
        print(f"Monitoring interval: {interval} seconds")
        
        while True:
            try:
                alert_count = self.run_monitoring_cycle()
                
                if alert_count == 0:
                    print(f"✅ All systems normal - {datetime.now().strftime('%H:%M:%S')}")
                else:
                    print(f"⚠️ {alert_count} alert(s) processed - {datetime.now().strftime('%H:%M:%S')}")
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\nStopping alert monitoring...")
                break
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                time.sleep(interval)

def main():
    alert_system = AlertSystem()
    
    # Run one cycle for testing
    print("Running alert check...")
    alert_count = alert_system.run_monitoring_cycle()
    print(f"Found {alert_count} alerts")
    
    # Uncomment to run continuous monitoring
    # alert_system.run_monitoring_loop()

if __name__ == "__main__":
    main()
