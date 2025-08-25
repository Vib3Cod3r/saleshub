#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  templatesDir: path.join(__dirname, '../docs/development-logs/templates'),
  logsDir: path.join(__dirname, '../docs/development-logs/logs'),
  reportsDir: path.join(__dirname, '../docs/development-logs/reports'),
  editor: process.env.EDITOR || 'code' // Default to VS Code
};

// Utility functions
function getCurrentDate() {
  // Use Hong Kong timezone
  const now = new Date();
  const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
  
  return {
    date: hkTime.toISOString().split('T')[0],
    dayOfWeek: hkTime.toLocaleDateString('en-US', { weekday: 'long' }),
    time: hkTime.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Hong_Kong' }),
    year: hkTime.getFullYear(),
    month: hkTime.toLocaleDateString('en-US', { month: 'long' }).toLowerCase(),
    weekNumber: getWeekNumber(hkTime)
  };
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getGitCommits(since = '1 day ago') {
  try {
    const commits = execSync(`git log --since="${since}" --pretty=format:"%h - %s"`, { encoding: 'utf8' });
    return commits.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return [];
  }
}

function getGitStats(since = '1 day ago') {
  try {
    const stats = execSync(`git log --since="${since}" --shortstat`, { encoding: 'utf8' });
    return stats;
  } catch (error) {
    return '';
  }
}

function processTemplate(templatePath, replacements) {
  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return content;
}

function createDailyLog() {
  const dateInfo = getCurrentDate();
  const yearDir = path.join(CONFIG.logsDir, dateInfo.year.toString());
  const monthDir = path.join(yearDir, `${String(dateInfo.year).slice(-2)}-${dateInfo.month}`);
  
  ensureDirectoryExists(monthDir);
  
  const logFileName = `${dateInfo.date}-daily-log.md`;
  const logFilePath = path.join(monthDir, logFileName);
  
  // Get git activity
  const commits = getGitCommits();
  const gitStats = getGitStats();
  
  const replacements = {
    DATE: dateInfo.date,
    DAY_OF_WEEK: dateInfo.dayOfWeek,
    START_TIME: dateInfo.time, // Use current HKT time
    END_TIME: '',   // Leave empty for user to fill
    TOTAL_HOURS: '',    // Leave empty for user to fill
    GIT_COMMITS: commits.map(commit => `- ${commit}`).join('\n'),
    GIT_STATS: gitStats
  };
  
  const templatePath = path.join(CONFIG.templatesDir, 'daily-log.md');
  const content = processTemplate(templatePath, replacements);
  
  fs.writeFileSync(logFilePath, content);
  
  console.log(`✅ Daily log created: ${logFilePath}`);
  console.log(`📝 Opening in editor...`);
  
  // Open in editor
  try {
    execSync(`${CONFIG.editor} "${logFilePath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`⚠️  Could not open editor. Please open manually: ${logFilePath}`);
  }
  
  return logFilePath;
}

function createWeeklySummary() {
  const dateInfo = getCurrentDate();
  const yearDir = path.join(CONFIG.logsDir, dateInfo.year.toString());
  
  ensureDirectoryExists(yearDir);
  
  const summaryFileName = `week-${dateInfo.weekNumber}-${dateInfo.year}-summary.md`;
  const summaryFilePath = path.join(yearDir, summaryFileName);
  
  // Calculate week start and end dates using HKT
  const now = new Date();
  const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
  const weekStart = new Date(hkTime);
  weekStart.setDate(hkTime.getDate() - hkTime.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const replacements = {
    WEEK_NUMBER: dateInfo.weekNumber,
    YEAR: dateInfo.year,
    START_DATE: weekStart.toISOString().split('T')[0],
    END_DATE: weekEnd.toISOString().split('T')[0],
    TOTAL_HOURS: '40', // Default weekly hours
    PRODUCTIVE_DAYS: '5',
    DEV_HOURS: '30',
    DEV_PERCENT: '75',
    DEBUG_HOURS: '5',
    DEBUG_PERCENT: '12.5',
    TEST_HOURS: '3',
    TEST_PERCENT: '7.5',
    REVIEW_HOURS: '1',
    REVIEW_PERCENT: '2.5',
    DOC_HOURS: '1',
    DOC_PERCENT: '2.5',
    MEETING_HOURS: '0',
    MEETING_PERCENT: '0',
    RESEARCH_HOURS: '0',
    RESEARCH_PERCENT: '0',
    AVG_DAILY_HOURS: '8',
    MOST_PRODUCTIVE_DAY: 'Tuesday',
    LEAST_PRODUCTIVE_DAY: 'Friday',
    FOCUS_TIME: '35',
    INTERRUPTION_TIME: '5'
  };
  
  const templatePath = path.join(CONFIG.templatesDir, 'weekly-summary.md');
  const content = processTemplate(templatePath, replacements);
  
  fs.writeFileSync(summaryFilePath, content);
  
  console.log(`✅ Weekly summary created: ${summaryFilePath}`);
  console.log(`📝 Opening in editor...`);
  
  try {
    execSync(`${CONFIG.editor} "${summaryFilePath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`⚠️  Could not open editor. Please open manually: ${summaryFilePath}`);
  }
  
  return summaryFilePath;
}

function createFeatureLog(featureName) {
  if (!featureName) {
    console.error('❌ Feature name is required');
    console.log('Usage: node create-log-entry.js feature "Feature Name"');
    process.exit(1);
  }
  
  const dateInfo = getCurrentDate();
  const featuresDir = path.join(CONFIG.logsDir, 'features');
  
  ensureDirectoryExists(featuresDir);
  
  const featureFileName = `${dateInfo.date}-${featureName.toLowerCase().replace(/\s+/g, '-')}-feature-log.md`;
  const featureFilePath = path.join(featuresDir, featureFileName);
  
  const replacements = {
    FEATURE_NAME: featureName,
    FEATURE_ID: `FEAT-${Date.now()}`,
    START_DATE: dateInfo.date,
    TARGET_DATE: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {timeZone: 'Asia/Hong_Kong'}).split('/').reverse().join('-'), // 1 week from now in HKT
    ACTUAL_DATE: '',
    DATE: dateInfo.date,
    STAGING_DATE: '',
    PRODUCTION_DATE: ''
  };
  
  const templatePath = path.join(CONFIG.templatesDir, 'feature-log.md');
  const content = processTemplate(templatePath, replacements);
  
  fs.writeFileSync(featureFilePath, content);
  
  console.log(`✅ Feature log created: ${featureFilePath}`);
  console.log(`📝 Opening in editor...`);
  
  try {
    execSync(`${CONFIG.editor} "${featureFilePath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`⚠️  Could not open editor. Please open manually: ${featureFilePath}`);
  }
  
  return featureFilePath;
}

function showHelp() {
  console.log(`
📝 Development Log System - SalesHub CRM

Usage: node create-log-entry.js <type> [options]

Types:
  daily                    Create a daily development log
  weekly                   Create a weekly summary
  feature <name>           Create a feature development log

Examples:
  node create-log-entry.js daily
  node create-log-entry.js weekly
  node create-log-entry.js feature "User Authentication"

Options:
  --help, -h               Show this help message
  --editor <editor>        Specify editor to open files (default: code)

Environment Variables:
  EDITOR                   Default editor to use

Features:
  ✅ Auto-generates templates with current date/time
  ✅ Integrates with git for commit tracking
  ✅ Opens files in your preferred editor
  ✅ Follows your project's DRY principles
  ✅ Organized by year/month/features
`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const type = args[0];
  
  switch (type) {
    case 'daily':
      createDailyLog();
      break;
    case 'weekly':
      createWeeklySummary();
      break;
    case 'feature':
      const featureName = args[1];
      createFeatureLog(featureName);
      break;
    default:
      console.error(`❌ Unknown type: ${type}`);
      showHelp();
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createDailyLog,
  createWeeklySummary,
  createFeatureLog,
  getCurrentDate,
  getGitCommits,
  getGitStats
};
