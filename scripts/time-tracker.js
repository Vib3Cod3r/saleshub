#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, '../docs/development-logs/time-tracking'),
  logsDir: path.join(__dirname, '../docs/development-logs/logs')
};

// Time tracking data structure
class TimeTracker {
  constructor() {
    this.ensureDataDirectory();
    // Use Hong Kong timezone
    const now = new Date();
    const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
    this.today = hkTime.toISOString().split('T')[0];
    this.dataFile = path.join(CONFIG.dataDir, `${this.today}.json`);
    this.sessions = this.loadSessions();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(CONFIG.dataDir)) {
      fs.mkdirSync(CONFIG.dataDir, { recursive: true });
    }
  }

  loadSessions() {
    if (fs.existsSync(this.dataFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
      } catch (error) {
        console.log('⚠️  Error loading existing sessions, starting fresh');
        return [];
      }
    }
    return [];
  }

  saveSessions() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.sessions, null, 2));
  }

  startSession(activity, description = '') {
    // Use Hong Kong timezone
    const now = new Date();
    const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
    
    const session = {
      id: Date.now(),
      activity,
      description,
      startTime: hkTime.toISOString(),
      endTime: null,
      duration: null
    };

    this.sessions.push(session);
    this.saveSessions();

    console.log(`⏱️  Started tracking: ${activity}`);
    if (description) {
      console.log(`📝 Description: ${description}`);
    }
    console.log(`🕐 Start time: ${new Date(session.startTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'})} HKT`);

    return session;
  }

  stopSession(sessionId = null) {
    let session;
    
    if (sessionId) {
      session = this.sessions.find(s => s.id === sessionId);
    } else {
      // Find the most recent active session
      session = this.sessions
        .filter(s => !s.endTime)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
    }

    if (!session) {
      console.log('❌ No active session found');
      return null;
    }

    // Use Hong Kong timezone
    const now = new Date();
    const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
    session.endTime = hkTime.toISOString();
    session.duration = this.calculateDuration(session.startTime, session.endTime);
    
    this.saveSessions();

    console.log(`⏹️  Stopped tracking: ${session.activity}`);
    console.log(`⏱️  Duration: ${this.formatDuration(session.duration)}`);
    console.log(`🕐 End time: ${new Date(session.endTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'})} HKT`);

    return session;
  }

  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return end - start; // Duration in milliseconds
  }

  formatDuration(durationMs) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getTodaySummary() {
    const completedSessions = this.sessions.filter(s => s.endTime);
    const activeSessions = this.sessions.filter(s => !s.endTime);

    const totalTime = completedSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Group by activity
    const activitySummary = {};
    completedSessions.forEach(session => {
      if (!activitySummary[session.activity]) {
        activitySummary[session.activity] = {
          totalTime: 0,
          sessions: 0
        };
      }
      activitySummary[session.activity].totalTime += session.duration;
      activitySummary[session.activity].sessions += 1;
    });

    return {
      totalTime,
      totalSessions: completedSessions.length,
      activeSessions: activeSessions.length,
      activitySummary
    };
  }

  displayTodaySummary() {
    const summary = this.getTodaySummary();
    
    console.log('\n📊 Today\'s Time Summary');
    console.log('='.repeat(50));
    console.log(`📅 Date: ${this.today}`);
    console.log(`⏱️  Total Time: ${this.formatDuration(summary.totalTime)}`);
    console.log(`📝 Sessions: ${summary.totalSessions}`);
    
    if (summary.activeSessions > 0) {
      console.log(`🔄 Active Sessions: ${summary.activeSessions}`);
    }

    if (Object.keys(summary.activitySummary).length > 0) {
      console.log('\n📈 Activity Breakdown:');
      Object.entries(summary.activitySummary).forEach(([activity, data]) => {
        console.log(`  ${activity}: ${this.formatDuration(data.totalTime)} (${data.sessions} sessions)`);
      });
    }

    if (summary.activeSessions > 0) {
      console.log('\n🔄 Active Sessions:');
      this.sessions
        .filter(s => !s.endTime)
        .forEach(session => {
          const duration = this.calculateDuration(session.startTime, new Date().toISOString());
          console.log(`  ${session.activity}: ${this.formatDuration(duration)} (started ${new Date(session.startTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'})} HKT)`);
        });
    }
  }

  exportToLog() {
    const summary = this.getTodaySummary();
    const yearDir = path.join(CONFIG.logsDir, new Date().getFullYear().toString());
    const monthDir = path.join(yearDir, `${String(new Date().getFullYear()).slice(-2)}-${new Date().toLocaleDateString('en-US', { month: 'long' }).toLowerCase()}`);
    
    if (!fs.existsSync(monthDir)) {
      console.log('❌ No log directory found for today');
      return;
    }

    const logFile = path.join(monthDir, `${this.today}-daily-log.md`);
    
    if (!fs.existsSync(logFile)) {
      console.log('❌ No daily log found for today');
      return;
    }

    let logContent = fs.readFileSync(logFile, 'utf8');
    
    // Create time breakdown table
    const timeBreakdown = Object.entries(summary.activitySummary)
      .map(([activity, data]) => {
        const hours = Math.floor(data.totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((data.totalTime % (1000 * 60 * 60)) / (1000 * 60));
        const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        return `| ${activity} | ${timeStr} | ${data.sessions} sessions |`;
      })
      .join('\n');

    const totalHours = Math.floor(summary.totalTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor((summary.totalTime % (1000 * 60 * 60)) / (1000 * 60));
    const totalTimeStr = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

    // Replace or add time breakdown section
    const timeBreakdownSection = `## ⏱️ Time Breakdown

| Activity | Time Spent | Notes |
|----------|------------|-------|
${timeBreakdown}
| **Total** | **${totalTimeStr}** | **${summary.totalSessions} sessions** |

**Total Productive Time**: ${totalTimeStr}`;

    // Check if time breakdown section already exists
    if (logContent.includes('## ⏱️ Time Breakdown')) {
      // Replace existing section
      logContent = logContent.replace(
        /## ⏱️ Time Breakdown[\s\S]*?(?=## |$)/,
        timeBreakdownSection
      );
    } else {
      // Add new section before the Code Quality section
      const codeQualityIndex = logContent.indexOf('## 🔍 Code Quality');
      if (codeQualityIndex !== -1) {
        logContent = logContent.slice(0, codeQualityIndex) + 
                    '\n\n' + timeBreakdownSection + '\n\n' + 
                    logContent.slice(codeQualityIndex);
      } else {
        // Add at the end if no Code Quality section
        logContent += '\n\n' + timeBreakdownSection;
      }
    }

    fs.writeFileSync(logFile, logContent);
    console.log(`✅ Time tracking data exported to: ${logFile}`);
  }
}

// Interactive CLI
class TimeTrackerCLI {
  constructor() {
    this.tracker = new TimeTracker();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('⏱️  Time Tracker - SalesHub CRM Development');
    console.log('='.repeat(50));
    
    this.tracker.displayTodaySummary();
    
    while (true) {
      console.log('\n📋 Available Commands:');
      console.log('  start <activity> [description]  - Start tracking an activity');
      console.log('  stop [session-id]               - Stop current or specific session');
      console.log('  status                          - Show current status');
      console.log('  summary                         - Show today\'s summary');
      console.log('  export                          - Export to daily log');
      console.log('  list                            - List all sessions');
      console.log('  quit                            - Exit time tracker');
      
      const input = await this.question('\nEnter command: ');
      const parts = input.trim().split(' ');
      const command = parts[0].toLowerCase();
      
      try {
        switch (command) {
          case 'start':
            if (parts.length < 2) {
              console.log('❌ Please specify an activity');
              break;
            }
            const activity = parts[1];
            const description = parts.slice(2).join(' ');
            this.tracker.startSession(activity, description);
            break;
            
          case 'stop':
            const sessionId = parts[1] ? parseInt(parts[1]) : null;
            this.tracker.stopSession(sessionId);
            break;
            
          case 'status':
            this.tracker.displayTodaySummary();
            break;
            
          case 'summary':
            this.tracker.displayTodaySummary();
            break;
            
          case 'export':
            this.tracker.exportToLog();
            break;
            
          case 'list':
            this.displaySessions();
            break;
            
          case 'quit':
          case 'exit':
            console.log('👋 Goodbye!');
            this.rl.close();
            return;
            
          default:
            console.log('❌ Unknown command. Type "quit" to exit.');
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  displaySessions() {
    console.log('\n📝 All Sessions Today:');
    console.log('='.repeat(50));
    
    if (this.tracker.sessions.length === 0) {
      console.log('No sessions recorded today.');
      return;
    }

    this.tracker.sessions.forEach((session, index) => {
      const startTime = new Date(session.startTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'});
      const status = session.endTime ? '✅ Completed' : '🔄 Active';
      
      console.log(`${index + 1}. ${session.activity} - ${status}`);
      console.log(`   Start: ${startTime} HKT`);
      
      if (session.description) {
        console.log(`   Description: ${session.description}`);
      }
      
      if (session.endTime) {
        const endTime = new Date(session.endTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'});
        console.log(`   End: ${endTime} HKT`);
        console.log(`   Duration: ${this.tracker.formatDuration(session.duration)}`);
      } else {
        const currentDuration = this.tracker.calculateDuration(session.startTime, new Date().toISOString());
        console.log(`   Duration: ${this.tracker.formatDuration(currentDuration)} (ongoing)`);
      }
      console.log('');
    });
  }
}

// Command line interface
function showHelp() {
  console.log(`
⏱️  Time Tracker - SalesHub CRM Development

Usage: node time-tracker.js [command] [options]

Commands:
  start <activity> [description]  Start tracking an activity
  stop [session-id]               Stop current or specific session
  status                          Show current status
  summary                         Show today's summary
  export                          Export to daily log
  list                            List all sessions
  interactive                     Start interactive mode

Examples:
  node time-tracker.js start "Development" "Working on user authentication"
  node time-tracker.js stop
  node time-tracker.js status
  node time-tracker.js export
  node time-tracker.js interactive

Features:
  ✅ Track time spent on different activities
  ✅ Automatic session management
  ✅ Export to daily development logs
  ✅ Interactive CLI mode
  ✅ Session history and summaries
  ✅ Integration with your project structure
`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const tracker = new TimeTracker();
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'start':
      if (args.length < 2) {
        console.log('❌ Please specify an activity');
        process.exit(1);
      }
      const activity = args[1];
      const description = args.slice(2).join(' ');
      tracker.startSession(activity, description);
      break;
      
    case 'stop':
      const sessionId = args[1] ? parseInt(args[1]) : null;
      tracker.stopSession(sessionId);
      break;
      
    case 'status':
    case 'summary':
      tracker.displayTodaySummary();
      break;
      
    case 'export':
      tracker.exportToLog();
      break;
      
    case 'list':
      // Display sessions in non-interactive mode
      console.log('\n📝 All Sessions Today:');
      console.log('='.repeat(50));
      
      if (tracker.sessions.length === 0) {
        console.log('No sessions recorded today.');
      } else {
        tracker.sessions.forEach((session, index) => {
          const startTime = new Date(session.startTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'});
          const status = session.endTime ? '✅ Completed' : '🔄 Active';
          
          console.log(`${index + 1}. ${session.activity} - ${status}`);
          console.log(`   Start: ${startTime} HKT`);
          
          if (session.description) {
            console.log(`   Description: ${session.description}`);
          }
          
          if (session.endTime) {
            const endTime = new Date(session.endTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Hong_Kong'});
            console.log(`   End: ${endTime} HKT`);
            console.log(`   Duration: ${tracker.formatDuration(session.duration)}`);
          } else {
            const currentDuration = tracker.calculateDuration(session.startTime, new Date().toISOString());
            console.log(`   Duration: ${tracker.formatDuration(currentDuration)} (ongoing)`);
          }
          console.log('');
        });
      }
      break;
      
    case 'interactive':
      const cli = new TimeTrackerCLI();
      cli.start();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  TimeTracker,
  TimeTrackerCLI
};
