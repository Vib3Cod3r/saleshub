package main

import (
	"fmt"
	"log"
	"saleshub-backend/config"
	"time"
)

type TaskRecord struct {
	ID             string     `json:"id"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	Priority       string     `json:"priority"`
	Status         string     `json:"status"`
	DueDate        *time.Time `json:"due_date"`
	CompletedAt    *time.Time `json:"completed_at"`
	AssignedUserID *string    `json:"assigned_user_id"`
	CreatedBy      string     `json:"created_by"`
	LeadID         *string    `json:"lead_id"`
	DealID         *string    `json:"deal_id"`
	TypeID         *string    `json:"type_id"`
	TenantID       string     `json:"tenant_id"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type User struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

type Lead struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type Deal struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type TaskType struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func main() {
	// Initialize database
	config.InitDatabase()

	// Get the default tenant
	var tenantID string
	err := config.DB.Raw("SELECT id FROM tenants WHERE name = 'Default Organization' LIMIT 1").Scan(&tenantID).Error
	if err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	fmt.Println("=== TASK RECORDS TABLE ===")
	fmt.Println("Generated on:", time.Now().Format("2006-01-02 15:04:05"))
	fmt.Println()

	// Fetch all tasks with related data
	var tasks []TaskRecord
	err = config.DB.Raw(`
		SELECT 
			t.id,
			t.title,
			t.description,
			t.priority,
			t.status,
			t.due_date,
			t.completed_at,
			t.assigned_user_id,
			t.created_by,
			t.lead_id,
			t.deal_id,
			t.type_id,
			t.tenant_id,
			t.created_at,
			t.updated_at
		FROM tasks t
		WHERE t.tenant_id = ?
		ORDER BY t.created_at DESC
	`, tenantID).Scan(&tasks).Error

	if err != nil {
		log.Fatal("Failed to fetch tasks:", err)
	}

	// Get user details for assigned and created by
	userMap := make(map[string]User)
	var users []User
	config.DB.Raw("SELECT id, first_name, last_name, email FROM users WHERE tenant_id = ?", tenantID).Scan(&users)
	for _, user := range users {
		userMap[user.ID] = user
	}

	// Print table header
	fmt.Printf("%-4s %-50s %-10s %-12s %-12s %-15s %-20s %-20s\n",
		"ID", "Title", "Priority", "Status", "Due Date", "Assigned To", "Created By", "Created At")
	fmt.Println(string(make([]byte, 150, 150)))
	for i := 0; i < 150; i++ {
		fmt.Print("-")
	}
	fmt.Println()

	// Print task records
	for i, task := range tasks {
		// Format due date
		dueDateStr := "No Due Date"
		if task.DueDate != nil {
			dueDateStr = task.DueDate.Format("2006-01-02")
		}

		// Get assigned user name
		assignedTo := "Unassigned"
		if task.AssignedUserID != nil {
			if user, exists := userMap[*task.AssignedUserID]; exists {
				assignedTo = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
			}
		}

		// Get created by user name
		createdBy := "Unknown"
		if user, exists := userMap[task.CreatedBy]; exists {
			createdBy = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
		}

		// Truncate title if too long
		title := task.Title
		if len(title) > 47 {
			title = title[:44] + "..."
		}

		// Print row
		fmt.Printf("%-4d %-50s %-10s %-12s %-12s %-15s %-20s %-20s\n",
			i+1,
			title,
			task.Priority,
			task.Status,
			dueDateStr,
			assignedTo,
			createdBy,
			task.CreatedAt.Format("2006-01-02 15:04"),
		)
	}

	fmt.Println()
	fmt.Println("=== TASK SUMMARY ===")

	// Count by priority
	var highCount, mediumCount, lowCount int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE priority = 'HIGH' AND tenant_id = ?", tenantID).Scan(&highCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE priority = 'MEDIUM' AND tenant_id = ?", tenantID).Scan(&mediumCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE priority = 'LOW' AND tenant_id = ?", tenantID).Scan(&lowCount)

	// Count by status
	var pendingCount, inProgressCount, completedCount int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE status = 'PENDING' AND tenant_id = ?", tenantID).Scan(&pendingCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE status = 'IN_PROGRESS' AND tenant_id = ?", tenantID).Scan(&inProgressCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE status = 'COMPLETED' AND tenant_id = ?", tenantID).Scan(&completedCount)

	// Count by due date
	var overdueCount, dueTodayCount, upcomingCount int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status != 'COMPLETED' AND tenant_id = ?", tenantID).Scan(&overdueCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE DATE(due_date) = CURRENT_DATE AND tenant_id = ?", tenantID).Scan(&dueTodayCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE due_date > NOW() AND tenant_id = ?", tenantID).Scan(&upcomingCount)

	// Count by assignment
	var assignedCount, unassignedCount int
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE assigned_user_id IS NOT NULL AND tenant_id = ?", tenantID).Scan(&assignedCount)
	config.DB.Raw("SELECT COUNT(*) FROM tasks WHERE assigned_user_id IS NULL AND tenant_id = ?", tenantID).Scan(&unassignedCount)

	fmt.Printf("Total Tasks: %d\n", len(tasks))
	fmt.Println()
	fmt.Println("By Priority:")
	fmt.Printf("  HIGH: %d tasks\n", highCount)
	fmt.Printf("  MEDIUM: %d tasks\n", mediumCount)
	fmt.Printf("  LOW: %d tasks\n", lowCount)
	fmt.Println()
	fmt.Println("By Status:")
	fmt.Printf("  PENDING: %d tasks\n", pendingCount)
	fmt.Printf("  IN_PROGRESS: %d tasks\n", inProgressCount)
	fmt.Printf("  COMPLETED: %d tasks\n", completedCount)
	fmt.Println()
	fmt.Println("By Due Date:")
	fmt.Printf("  Overdue: %d tasks\n", overdueCount)
	fmt.Printf("  Due Today: %d tasks\n", dueTodayCount)
	fmt.Printf("  Upcoming: %d tasks\n", upcomingCount)
	fmt.Println()
	fmt.Println("By Assignment:")
	fmt.Printf("  Assigned: %d tasks\n", assignedCount)
	fmt.Printf("  Unassigned: %d tasks\n", unassignedCount)
	fmt.Println()

	// Show some sample task details
	fmt.Println("=== SAMPLE TASK DETAILS ===")
	if len(tasks) > 0 {
		for i := 0; i < 3 && i < len(tasks); i++ {
			task := tasks[i]
			fmt.Printf("\nTask %d:\n", i+1)
			fmt.Printf("  Title: %s\n", task.Title)
			fmt.Printf("  Description: %s\n", task.Description)
			fmt.Printf("  Priority: %s\n", task.Priority)
			fmt.Printf("  Status: %s\n", task.Status)
			if task.DueDate != nil {
				fmt.Printf("  Due Date: %s\n", task.DueDate.Format("2006-01-02 15:04:05"))
			}
			if task.CompletedAt != nil {
				fmt.Printf("  Completed: %s\n", task.CompletedAt.Format("2006-01-02 15:04:05"))
			}
		}
	}
}
