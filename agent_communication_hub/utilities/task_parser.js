/**
 * Task Assignment Parser Utility
 * Parses instructions.md for task assignments and communication delimiters
 */

const fs = require('fs');
const path = require('path');

class TaskParser {
  constructor(hubPath = './agent_communication_hub') {
    this.hubPath = hubPath;
    this.instructionsFile = path.join(hubPath, 'instructions.md');
    this.statusFile = path.join(hubPath, 'agent_status.json');
    this.tasksFile = path.join(hubPath, 'task_assignments.json');
  }

  /**
   * Parse instructions.md for new tasks and delimiters
   */
  parseInstructions() {
    try {
      const content = fs.readFileSync(this.instructionsFile, 'utf8');
      
      return {
        tasks: this.extractTasks(content),
        delimiters: this.extractDelimiters(content),
        lastUpdate: this.getLastUpdate(content),
        communicationStatus: this.getCommunicationStatus(content)
      };
    } catch (error) {
      console.error('Error parsing instructions:', error);
      return null;
    }
  }

  /**
   * Extract JSON task objects from markdown content
   */
  extractTasks(content) {
    const tasks = [];
    const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
    let match;

    while ((match = jsonRegex.exec(content)) !== null) {
      try {
        const taskData = JSON.parse(match[1]);
        if (taskData.task_id && taskData.assigned_to) {
          tasks.push(taskData);
        }
      } catch (error) {
        console.warn('Invalid JSON in task assignment:', error);
      }
    }

    return tasks;
  }

  /**
   * Extract communication delimiters
   */
  extractDelimiters(content) {
    const delimiters = [];
    const delimiterRegex = /\((TASK_ASSIGNED|COMMUNICATION_OVER|URGENT|QUESTION|BLOCKED)\)/g;
    let match;

    while ((match = delimiterRegex.exec(content)) !== null) {
      delimiters.push({
        type: match[1],
        position: match.index,
        timestamp: new Date().toISOString()
      });
    }

    return delimiters;
  }

  /**
   * Get last update timestamp from content
   */
  getLastUpdate(content) {
    const updateMatch = content.match(/\*\*Last Updated\*\*:\s*([^\n]+)/);
    return updateMatch ? updateMatch[1].trim() : null;
  }

  /**
   * Check communication status
   */
  getCommunicationStatus(content) {
    if (content.includes('(COMMUNICATION_OVER)')) {
      return 'complete';
    } else if (content.includes('(TASK_ASSIGNED)')) {
      return 'task_assigned';
    } else if (content.includes('(URGENT)')) {
      return 'urgent';
    } else if (content.includes('(QUESTION)')) {
      return 'question_pending';
    } else if (content.includes('(BLOCKED)')) {
      return 'blocked';
    }
    return 'active';
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentName, status, currentTask = null) {
    try {
      const statusData = JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
      
      if (statusData.agents[agentName]) {
        statusData.agents[agentName].status = status;
        statusData.agents[agentName].current_task = currentTask;
        statusData.agents[agentName].last_activity = new Date().toISOString();
        
        if (status === 'completed_task') {
          statusData.agents[agentName].completed_tasks_today += 1;
        }
      }

      statusData.last_updated = new Date().toISOString();
      
      fs.writeFileSync(this.statusFile, JSON.stringify(statusData, null, 2));
      return true;
    } catch (error) {
      console.error('Error updating agent status:', error);
      return false;
    }
  }

  /**
   * Add task to assignments
   */
  addTaskAssignment(taskData) {
    try {
      const assignments = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
      
      assignments.active_tasks[taskData.task_id] = {
        ...taskData,
        assigned_at: new Date().toISOString(),
        status: 'assigned'
      };

      assignments.assignment_history.push({
        task_id: taskData.task_id,
        assigned_to: taskData.assigned_to,
        assigned_at: new Date().toISOString(),
        action: 'assigned'
      });

      fs.writeFileSync(this.tasksFile, JSON.stringify(assignments, null, 2));
      return true;
    } catch (error) {
      console.error('Error adding task assignment:', error);
      return false;
    }
  }

  /**
   * Monitor for changes (to be called periodically)
   */
  monitorInstructions(callback) {
    let lastModified = 0;
    
    const checkForChanges = () => {
      try {
        const stats = fs.statSync(this.instructionsFile);
        const modified = stats.mtime.getTime();
        
        if (modified > lastModified) {
          lastModified = modified;
          const parsed = this.parseInstructions();
          if (parsed && callback) {
            callback(parsed);
          }
        }
      } catch (error) {
        console.error('Error monitoring instructions:', error);
      }
    };

    // Check every 30 seconds
    setInterval(checkForChanges, 30000);
    
    // Initial check
    checkForChanges();
  }
}

module.exports = TaskParser;
