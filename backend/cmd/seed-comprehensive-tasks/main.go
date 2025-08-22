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

	log.Println("Creating comprehensive task data...")

	// Create task types
	taskTypes := []struct {
		id   string
		name string
	}{
		{uuid.New().String(), "Follow-up Call"},
		{uuid.New().String(), "Email Campaign"},
		{uuid.New().String(), "Meeting"},
		{uuid.New().String(), "Proposal Review"},
		{uuid.New().String(), "Contract Negotiation"},
		{uuid.New().String(), "Demo Presentation"},
		{uuid.New().String(), "Research"},
		{uuid.New().String(), "Documentation"},
		{uuid.New().String(), "Training"},
		{uuid.New().String(), "Support"},
	}

	for _, taskType := range taskTypes {
		err := config.DB.Exec(`
			INSERT INTO task_types (id, name, tenant_id, created_at, updated_at)
			VALUES (?, ?, ?, NOW(), NOW())
			ON CONFLICT (id) DO NOTHING
		`, taskType.id, taskType.name, tenantID).Error
		if err != nil {
			log.Printf("Failed to create task type %s: %v", taskType.name, err)
		} else {
			log.Printf("Created task type: %s", taskType.name)
		}
	}

	// Create sample leads
	leads := []struct {
		id        string
		firstName string
		lastName  string
		email     string
	}{
		{uuid.New().String(), "John", "Smith", "john.smith@techcorp.com"},
		{uuid.New().String(), "Sarah", "Johnson", "sarah.johnson@innovate.com"},
		{uuid.New().String(), "Michael", "Brown", "michael.brown@startup.io"},
		{uuid.New().String(), "Emily", "Davis", "emily.davis@enterprise.com"},
		{uuid.New().String(), "David", "Wilson", "david.wilson@scaleup.com"},
		{uuid.New().String(), "Lisa", "Anderson", "lisa.anderson@growth.com"},
		{uuid.New().String(), "Robert", "Taylor", "robert.taylor@expand.com"},
		{uuid.New().String(), "Jennifer", "Martinez", "jennifer.martinez@scale.com"},
	}

	for _, lead := range leads {
		err := config.DB.Exec(`
			INSERT INTO leads (id, first_name, last_name, email, tenant_id, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, NOW(), NOW())
			ON CONFLICT (id) DO NOTHING
		`, lead.id, lead.firstName, lead.lastName, lead.email, tenantID).Error
		if err != nil {
			log.Printf("Failed to create lead %s %s: %v", lead.firstName, lead.lastName, err)
		} else {
			log.Printf("Created lead: %s %s", lead.firstName, lead.lastName)
		}
	}

	// Create sample deals
	deals := []struct {
		id   string
		name string
	}{
		{uuid.New().String(), "Enterprise CRM Implementation"},
		{uuid.New().String(), "SaaS Platform License"},
		{uuid.New().String(), "Custom Development Project"},
		{uuid.New().String(), "Consulting Services"},
		{uuid.New().String(), "Training Program"},
		{uuid.New().String(), "Support Contract"},
		{uuid.New().String(), "Integration Project"},
		{uuid.New().String(), "Migration Services"},
	}

	for _, deal := range deals {
		err := config.DB.Exec(`
			INSERT INTO deals (id, name, tenant_id, created_at, updated_at)
			VALUES (?, ?, ?, NOW(), NOW())
			ON CONFLICT (id) DO NOTHING
		`, deal.id, deal.name, tenantID).Error
		if err != nil {
			log.Printf("Failed to create deal %s: %v", deal.name, err)
		} else {
			log.Printf("Created deal: %s", deal.name)
		}
	}

	// Get user IDs for assignment
	var userIDs []string
	config.DB.Raw("SELECT id FROM users WHERE tenant_id = ? LIMIT 5", tenantID).Scan(&userIDs)

	if len(userIDs) == 0 {
		log.Fatal("No users found for task assignment")
	}

	// Get created task types, leads, and deals
	var taskTypeIDs []string
	config.DB.Raw("SELECT id FROM task_types WHERE tenant_id = ?", tenantID).Scan(&taskTypeIDs)

	var leadIDs []string
	config.DB.Raw("SELECT id FROM leads WHERE tenant_id = ?", tenantID).Scan(&leadIDs)

	var dealIDs []string
	config.DB.Raw("SELECT id FROM deals WHERE tenant_id = ?", tenantID).Scan(&dealIDs)

	// Create comprehensive task data
	tasks := []struct {
		title       string
		description string
		priority    string
		status      string
		dueDate     *time.Time
		completedAt *time.Time
		assignedTo  string
		createdBy   string
		leadID      *string
		dealID      *string
		typeID      *string
	}{
		// High Priority - Overdue
		{
			title:       "Follow up with John Smith on proposal",
			description: "Call to discuss the enterprise CRM proposal and address any concerns",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // 3 days ago
			assignedTo:  userIDs[0],
			createdBy:   userIDs[1],
			leadID:      &leadIDs[0],
			dealID:      &dealIDs[0],
			typeID:      &taskTypeIDs[0],
		},
		{
			title:       "Prepare demo for Sarah Johnson",
			description: "Create custom demo showcasing features relevant to their business needs",
			priority:    "HIGH",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday
			assignedTo:  userIDs[1],
			createdBy:   userIDs[0],
			leadID:      &leadIDs[1],
			dealID:      &dealIDs[1],
			typeID:      &taskTypeIDs[6],
		},
		{
			title:       "Review contract terms with Michael Brown",
			description: "Go through contract details and negotiate final terms",
			priority:    "HIGH",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -2)}[0], // 2 days ago
			assignedTo:  userIDs[2],
			createdBy:   userIDs[1],
			leadID:      &leadIDs[2],
			dealID:      &dealIDs[2],
			typeID:      &taskTypeIDs[4],
		},

		// Medium Priority - Due Today
		{
			title:       "Send follow-up email to Emily Davis",
			description: "Send personalized follow-up email with additional information requested",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now()}[0], // Today
			assignedTo:  userIDs[0],
			createdBy:   userIDs[2],
			leadID:      &leadIDs[3],
			dealID:      &dealIDs[3],
			typeID:      &taskTypeIDs[1],
		},
		{
			title:       "Schedule meeting with David Wilson",
			description: "Coordinate with David's team to schedule the technical review meeting",
			priority:    "MEDIUM",
			status:      "IN_PROGRESS",
			dueDate:     &[]time.Time{time.Now()}[0], // Today
			assignedTo:  userIDs[1],
			createdBy:   userIDs[0],
			leadID:      &leadIDs[4],
			dealID:      &dealIDs[4],
			typeID:      &taskTypeIDs[2],
		},

		// Medium Priority - Upcoming
		{
			title:       "Prepare presentation for Lisa Anderson",
			description: "Create comprehensive presentation for the quarterly business review",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 2)}[0], // Day after tomorrow
			assignedTo:  userIDs[2],
			createdBy:   userIDs[1],
			leadID:      &leadIDs[5],
			dealID:      &dealIDs[5],
			typeID:      &taskTypeIDs[6],
		},
		{
			title:       "Research competitor analysis for Robert Taylor",
			description: "Gather information about competitors and market positioning",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 3)}[0], // In 3 days
			assignedTo:  userIDs[0],
			createdBy:   userIDs[2],
			leadID:      &leadIDs[6],
			dealID:      &dealIDs[6],
			typeID:      &taskTypeIDs[6],
		},

		// Low Priority - Upcoming
		{
			title:       "Update documentation for Jennifer Martinez",
			description: "Update user guides and technical documentation",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 7)}[0], // Next week
			assignedTo:  userIDs[1],
			createdBy:   userIDs[0],
			leadID:      &leadIDs[7],
			dealID:      &dealIDs[7],
			typeID:      &taskTypeIDs[7],
		},
		{
			title:       "Schedule training session",
			description: "Coordinate training schedule for new client onboarding",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 10)}[0], // In 10 days
			assignedTo:  userIDs[2],
			createdBy:   userIDs[1],
			leadID:      &leadIDs[0],
			dealID:      &dealIDs[4],
			typeID:      &taskTypeIDs[8],
		},

		// Completed Tasks
		{
			title:       "Initial contact with John Smith",
			description: "Made first contact and gathered requirements",
			priority:    "MEDIUM",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -5)}[0], // 5 days ago
			completedAt: &[]time.Time{time.Now().AddDate(0, 0, -4)}[0], // 4 days ago
			assignedTo:  userIDs[0],
			createdBy:   userIDs[1],
			leadID:      &leadIDs[0],
			typeID:      &taskTypeIDs[0],
		},
		{
			title:       "Send proposal to Sarah Johnson",
			description: "Sent detailed proposal with pricing and timeline",
			priority:    "HIGH",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // 3 days ago
			completedAt: &[]time.Time{time.Now().AddDate(0, 0, -3)}[0], // 3 days ago
			assignedTo:  userIDs[1],
			createdBy:   userIDs[0],
			leadID:      &leadIDs[1],
			dealID:      &dealIDs[1],
			typeID:      &taskTypeIDs[3],
		},
		{
			title:       "Technical review with Michael Brown",
			description: "Completed technical review and addressed all questions",
			priority:    "MEDIUM",
			status:      "COMPLETED",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, -2)}[0], // 2 days ago
			completedAt: &[]time.Time{time.Now().AddDate(0, 0, -1)}[0], // Yesterday
			assignedTo:  userIDs[2],
			createdBy:   userIDs[1],
			leadID:      &leadIDs[2],
			dealID:      &dealIDs[2],
			typeID:      &taskTypeIDs[2],
		},

		// Unassigned Tasks
		{
			title:       "Market research for new product",
			description: "Conduct market research for potential new product launch",
			priority:    "MEDIUM",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 5)}[0], // In 5 days
			createdBy:   userIDs[0],
			typeID:      &taskTypeIDs[6],
		},
		{
			title:       "Update website content",
			description: "Refresh website content with latest product information",
			priority:    "LOW",
			status:      "PENDING",
			dueDate:     &[]time.Time{time.Now().AddDate(0, 0, 14)}[0], // In 2 weeks
			createdBy:   userIDs[1],
			typeID:      &taskTypeIDs[7],
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
				INSERT INTO tasks (id, title, description, type_id, priority, status, due_date, completed_at, 
					assigned_user_id, created_by, lead_id, deal_id, tenant_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
			`, taskID, taskData.title, taskData.description, taskData.typeID, taskData.priority, taskData.status,
				taskData.dueDate, taskData.completedAt, taskData.assignedTo, taskData.createdBy,
				taskData.leadID, taskData.dealID, tenantID).Error

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

	log.Println("=== COMPREHENSIVE TASK DATA CREATED ===")
	log.Printf("• %d tasks created with realistic relationships", createdCount)
	log.Printf("• %d task types created", len(taskTypes))
	log.Printf("• %d leads created", len(leads))
	log.Printf("• %d deals created", len(deals))
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
