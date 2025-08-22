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

	// Get task type IDs - if not found, we'll use NULL
	var taskTypeID *string
	var tempTaskTypeID string
	err = config.DB.Raw("SELECT id FROM task_types WHERE name = 'General' AND tenant_id = ? LIMIT 1", tenantID).Scan(&tempTaskTypeID).Error
	if err == nil && tempTaskTypeID != "" {
		taskTypeID = &tempTaskTypeID
	}

	// Sample tasks data
	tasks := []struct {
		title       string
		description string
		priority    string
		status      string
		dueDate     *time.Time
	}{
		{
			title:       "Follow up with John Smith",
			description: "Call to discuss proposal feedback",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 1)}[0], // Tomorrow
		},
		{
			title:       "Send proposal to ABC Corp",
			description: "Email the updated proposal document",
			priority:    "MEDIUM",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 2)}[0], // Day after tomorrow
		},
		{
			title:       "Review quarterly reports",
			description: "Analyze Q3 performance metrics",
			priority:    "LOW",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday
		},
		{
			title:       "Schedule team meeting",
			description: "Organize weekly team sync",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now()}[0], // Today
		},
		{
			title:       "Update CRM data",
			description: "Clean up duplicate contacts",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 7)}[0], // Next week
		},
		{
			title:       "Prepare presentation",
			description: "Create slides for client meeting",
			priority:    "HIGH",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -2)}[0], // Overdue
		},
		{
			title:       "Call potential client",
			description: "Initial contact with XYZ Inc",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 3)}[0], // In 3 days
		},
		{
			title:       "Update website content",
			description: "Refresh product descriptions",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 14)}[0], // In 2 weeks
		},
		{
			title:       "Review budget proposal",
			description: "Analyze project cost estimates",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // Overdue
		},
		{
			title:       "Send thank you emails",
			description: "Follow up with recent customers",
			priority:    "MEDIUM",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday
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
			var typeIDValue interface{}
			if taskTypeID != nil {
				typeIDValue = *taskTypeID
			} else {
				typeIDValue = nil
			}

			err = config.DB.Exec(`
				INSERT INTO tasks (id, title, description, type_id, priority, status, due_date, tenant_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
			`, taskID, taskData.title, taskData.description, typeIDValue, taskData.priority, taskData.status, taskData.dueDate, tenantID).Error

			if err != nil {
				log.Printf("Failed to create task %s: %v", taskData.title, err)
				continue
			}

			createdCount++
			log.Printf("Created task: %s (%s) - Priority: %s, Status: %s, Due: %s",
				taskData.title, taskData.description, taskData.priority, taskData.status, taskData.dueDate.Format("2006-01-02"))
		} else {
			log.Printf("Task already exists: %s", taskData.title)
		}
	}

	log.Println("=== TASKS CREATED ===")
	log.Printf("• %d tasks created with various priorities, statuses, and due dates", createdCount)
	log.Println("These tasks will appear in the tasks page with proper filtering!")
	log.Println()

	// Show summary of created tasks
	log.Println("Task Summary:")
	for i, taskData := range tasks {
		log.Printf("%d. %s (%s) - Due: %s", i+1, taskData.title, taskData.status, taskData.dueDate.Format("2006-01-02"))
	}
}
