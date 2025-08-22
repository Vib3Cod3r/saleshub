package main

import (
	"log"
	"saleshub-backend/config"
	"time"

	"github.com/google/uuid"
)

func main() {
	// Initialize database
	config.InitDatabase()

	// Get the default tenant
	var tenantID string
	err := config.DB.Raw("SELECT id FROM tenants WHERE name = 'Default Organization' LIMIT 1").Scan(&tenantID).Error
	if err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	log.Println("Creating simple task data...")

	// Get user IDs for assignment
	var userIDs []string
	config.DB.Raw("SELECT id FROM users WHERE tenant_id = ? LIMIT 5", tenantID).Scan(&userIDs)

	if len(userIDs) == 0 {
		log.Fatal("No users found for task assignment")
	}

	// Create comprehensive task data without complex relationships
	tasks := []struct {
		title       string
		description string
		priority    string
		status      string
		dueDate     *time.Time
		completedAt *time.Time
		assignedTo  *string
		createdBy   string
	}{
		// High Priority - Overdue
		{
			title:       "Follow up with John Smith on proposal",
			description: "Call to discuss the enterprise CRM proposal and address any concerns",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // 3 days ago
			assignedTo:  &userIDs[0],
			createdBy:   userIDs[1],
		},
		{
			title:       "Prepare demo for Sarah Johnson",
			description: "Create custom demo showcasing features relevant to their business needs",
			priority:    "HIGH",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday
			assignedTo:  &userIDs[1],
			createdBy:   userIDs[0],
		},
		{
			title:       "Review contract terms with Michael Brown",
			description: "Go through contract details and negotiate final terms",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -2)}[0], // 2 days ago
			assignedTo:  &userIDs[2],
			createdBy:   userIDs[1],
		},

		// Medium Priority - Due Today
		{
			title:       "Send follow-up email to Emily Davis",
			description: "Send personalized follow-up email with additional information requested",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now()}[0], // Today
			assignedTo:  &userIDs[0],
			createdBy:   userIDs[2],
		},
		{
			title:       "Schedule meeting with David Wilson",
			description: "Coordinate with David's team to schedule the technical review meeting",
			priority:    "MEDIUM",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now()}[0], // Today
			assignedTo:  &userIDs[1],
			createdBy:   userIDs[0],
		},

		// Medium Priority - Upcoming
		{
			title:       "Prepare presentation for Lisa Anderson",
			description: "Create comprehensive presentation for the quarterly business review",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 2)}[0], // Day after tomorrow
			assignedTo:  &userIDs[2],
			createdBy:   userIDs[1],
		},
		{
			title:       "Research competitor analysis for Robert Taylor",
			description: "Gather information about competitors and market positioning",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 3)}[0], // In 3 days
			assignedTo:  &userIDs[0],
			createdBy:   userIDs[2],
		},

		// Low Priority - Upcoming
		{
			title:       "Update documentation for Jennifer Martinez",
			description: "Update user guides and technical documentation",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 7)}[0], // Next week
			assignedTo:  &userIDs[1],
			createdBy:   userIDs[0],
		},
		{
			title:       "Schedule training session",
			description: "Coordinate training schedule for new client onboarding",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 10)}[0], // In 10 days
			assignedTo:  &userIDs[2],
			createdBy:   userIDs[1],
		},

		// Completed Tasks
		{
			title:       "Initial contact with John Smith",
			description: "Made first contact and gathered requirements",
			priority:    "MEDIUM",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -5)}[0], // 5 days ago
			completedAt: &[]time.Time{time.Now().AddDate(0, 0, -4)}[0], // 4 days ago
			assignedTo:  &userIDs[0],
			createdBy:   userIDs[1],
		},
		{
			title:       "Send proposal to Sarah Johnson",
			description: "Sent detailed proposal with pricing and timeline",
			priority:    "HIGH",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // 3 days ago
			completedAt: &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // 3 days ago
			assignedTo:  &userIDs[1],
			createdBy:   userIDs[0],
		},
		{
			title:       "Technical review with Michael Brown",
			description: "Completed technical review and addressed all questions",
			priority:    "MEDIUM",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -2)}[0], // 2 days ago
			completedAt: &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday
			assignedTo:  &userIDs[2],
			createdBy:   userIDs[1],
		},

		// Unassigned Tasks
		{
			title:       "Market research for new product",
			description: "Conduct market research for potential new product launch",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 5)}[0], // In 5 days
			createdBy:   userIDs[0],
		},
		{
			title:       "Update website content",
			description: "Refresh website content with latest product information",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 14)}[0], // In 2 weeks
			createdBy:   userIDs[1],
		},
		{
			title:       "Review quarterly reports",
			description: "Analyze Q3 performance metrics and prepare summary",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 21)}[0], // In 3 weeks
			createdBy:   userIDs[2],
		},
		{
			title:       "Prepare budget proposal",
			description: "Create detailed budget proposal for next fiscal year",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 4)}[0], // In 4 days
			createdBy:   userIDs[0],
		},
		{
			title:       "Client feedback analysis",
			description: "Analyze recent client feedback and identify improvement areas",
			priority:    "MEDIUM",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 6)}[0], // In 6 days
			assignedTo:  &userIDs[1],
			createdBy:   userIDs[2],
		},
		{
			title:       "Team meeting preparation",
			description: "Prepare agenda and materials for weekly team meeting",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 1)}[0], // Tomorrow
			assignedTo:  &userIDs[2],
			createdBy:   userIDs[0],
		},
		{
			title:       "Database optimization",
			description: "Review and optimize database performance for better query speeds",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 8)}[0], // In 8 days
			createdBy:   userIDs[1],
		},
		{
			title:       "Security audit review",
			description: "Review security audit findings and implement recommendations",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday (overdue)
			assignedTo:  &userIDs[0],
			createdBy:   userIDs[1],
		},
		{
			title:       "API documentation update",
			description: "Update API documentation with latest endpoint changes",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 12)}[0], // In 12 days
			assignedTo:  &userIDs[2],
			createdBy:   userIDs[0],
		},
		{
			title:       "Performance testing",
			description: "Run comprehensive performance tests on new features",
			priority:    "MEDIUM",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 3)}[0], // In 3 days
			assignedTo:  &userIDs[1],
			createdBy:   userIDs[2],
		},
	}

	createdCount := 0
	for _, taskData := range tasks {
		// Check if task already exists
		var existingTaskID string
		err := config.DB.Raw("SELECT id FROM tasks WHERE title = ? AND tenant_id = ? LIMIT 1",
			taskData.title, tenantID).Scan(&existingTaskID).Error

		if err == nil && existingTaskID == "" {
			// Create new task
			taskID := uuid.New().String()

			// Insert task
			err = config.DB.Exec(`
				INSERT INTO tasks (id, title, description, priority, status, due_date, completed_at, 
					assigned_user_id, created_by, tenant_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
			`, taskID, taskData.title, taskData.description, taskData.priority, taskData.status,
				taskData.dueDate, taskData.completedAt, taskData.assignedTo, taskData.createdBy, tenantID).Error

			if err != nil {
				log.Printf("Failed to create task %s: %v", taskData.title, err)
				continue
			}

			createdCount++
			log.Printf("Created task: %s (%s) - Priority: %s, Status: %s, Due: %s",
				taskData.title, taskData.description, taskData.priority, taskData.status,
				taskData.dueDate.Format("2006-01-02"))
		} else {
			log.Printf("Task already exists: %s", taskData.title)
		}
	}

	log.Println("=== SIMPLE TASK DATA CREATED ===")
	log.Printf("• %d tasks created with realistic data", createdCount)
	log.Println()
	log.Println("Task Summary by Priority:")
	log.Printf("• HIGH Priority: %d tasks", countTasksByPriority("HIGH"))
	log.Printf("• MEDIUM Priority: %d tasks", countTasksByPriority("MEDIUM"))
	log.Printf("• LOW Priority: %d tasks", countTasksByPriority("LOW"))
	log.Println()
	log.Println("Task Summary by Status:")
	log.Printf("• PENDING: %d tasks", countTasksByStatus("PENDING"))
	log.Printf("• IN_PROGRESS: %d tasks", countTasksByStatus("IN_PROGRESS"))
	log.Printf("• COMPLETED: %d tasks", countTasksByStatus("COMPLETED"))
	log.Println()
	log.Println("Task Summary by Due Date:")
	log.Printf("• Overdue: %d tasks", countOverdueTasks())
	log.Printf("• Due Today: %d tasks", countTasksDueToday())
	log.Printf("• Upcoming: %d tasks", countUpcomingTasks())
	log.Println()
	log.Println("Task Summary by Assignment:")
	log.Printf("• Assigned: %d tasks", countAssignedTasks())
	log.Printf("• Unassigned: %d tasks", countUnassignedTasks())
}

func countTasksByPriority(priority string) int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE priority = ?", priority).Scan(&count)
	return count
}

func countTasksByStatus(status string) int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE status = ?", status).Scan(&count)
	return count
}

func countOverdueTasks() int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status != 'COMPLETED'").Scan(&count)
	return count
}

func countTasksDueToday() int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE DATE(due_date) = CURRENT_DATE").Scan(&count)
	return count
}

func countUpcomingTasks() int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE due_date > NOW()").Scan(&count)
	return count
}

func countAssignedTasks() int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE assigned_user_id IS NOT NULL").Scan(&count)
	return count
}

func countUnassignedTasks() int {
	var count int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE assigned_user_id IS NULL").Scan(&count)
	return count
}
