package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"time"

	_ "github.com/lib/pq"
)

type Deal struct {
	ID                string
	Name              string
	Amount            int
	Probability       int
	Currency          string
	ExpectedCloseDate *time.Time
	ActualCloseDate   *time.Time
	PipelineID        string
	StageID           string
	AssignedUserID    *string
	CompanyID         *string
	ContactID         *string
	CreatedBy         string
	TenantID          string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type User struct {
	ID        string
	FirstName string
	LastName  string
}

type Company struct {
	ID   string
	Name string
}

type Contact struct {
	ID        string
	FirstName string
	LastName  string
}

type Stage struct {
	ID          string
	Name        string
	Probability int
	Order       int
}

func main() {
	// Database connection
	db, err := sql.Open("postgres", "postgresql://postgres:Miyako2020@localhost:5432/sales_crm?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("Connected to database successfully")

	// Get tenant ID
	var tenantID string
	err = db.QueryRow("SELECT id FROM tenants WHERE subdomain = 'default' LIMIT 1").Scan(&tenantID)
	if err != nil {
		log.Fatal("Failed to get tenant ID:", err)
	}
	fmt.Printf("Using tenant ID: %s\n", tenantID)

	// Get pipeline ID
	var pipelineID string
	err = db.QueryRow("SELECT id FROM pipelines WHERE tenant_id = $1 LIMIT 1", tenantID).Scan(&pipelineID)
	if err != nil {
		log.Fatal("Failed to get pipeline ID:", err)
	}
	fmt.Printf("Using pipeline ID: %s\n", pipelineID)

	// Get stages
	stageRows, err := db.Query("SELECT id, name, probability, \"order\" FROM stages WHERE pipeline_id = $1 ORDER BY \"order\"", pipelineID)
	if err != nil {
		log.Fatal("Failed to get stages:", err)
	}
	defer stageRows.Close()

	var stages []Stage
	for stageRows.Next() {
		var stage Stage
		err := stageRows.Scan(&stage.ID, &stage.Name, &stage.Probability, &stage.Order)
		if err != nil {
			log.Fatal("Failed to scan stage:", err)
		}
		stages = append(stages, stage)
	}
	fmt.Printf("Found %d stages\n", len(stages))

	// Get users
	userRows, err := db.Query("SELECT id, first_name, last_name FROM users WHERE tenant_id = $1", tenantID)
	if err != nil {
		log.Fatal("Failed to get users:", err)
	}
	defer userRows.Close()

	var users []User
	for userRows.Next() {
		var user User
		err := userRows.Scan(&user.ID, &user.FirstName, &user.LastName)
		if err != nil {
			log.Fatal("Failed to scan user:", err)
		}
		users = append(users, user)
	}
	fmt.Printf("Found %d users\n", len(users))

	// Get companies
	companyRows, err := db.Query("SELECT id, name FROM companies WHERE tenant_id = $1 LIMIT 20", tenantID)
	if err != nil {
		log.Fatal("Failed to get companies:", err)
	}
	defer companyRows.Close()

	var companies []Company
	for companyRows.Next() {
		var company Company
		err := companyRows.Scan(&company.ID, &company.Name)
		if err != nil {
			log.Fatal("Failed to scan company:", err)
		}
		companies = append(companies, company)
	}
	fmt.Printf("Found %d companies\n", len(companies))

	// Get contacts
	contactRows, err := db.Query("SELECT id, first_name, last_name FROM contacts WHERE tenant_id = $1 LIMIT 30", tenantID)
	if err != nil {
		log.Fatal("Failed to get contacts:", err)
	}
	defer contactRows.Close()

	var contacts []Contact
	for contactRows.Next() {
		var contact Contact
		err := contactRows.Scan(&contact.ID, &contact.FirstName, &contact.LastName)
		if err != nil {
			log.Fatal("Failed to scan contact:", err)
		}
		contacts = append(contacts, contact)
	}
	fmt.Printf("Found %d contacts\n", len(contacts))

	// Deal names and amounts
	dealNames := []string{
		"Enterprise Software License",
		"Cloud Infrastructure Package",
		"Consulting Services Contract",
		"Training Program",
		"Support Agreement",
		"Custom Development Project",
		"Data Migration Service",
		"Security Audit",
		"Performance Optimization",
		"Integration Project",
		"Mobile App Development",
		"Website Redesign",
		"E-commerce Platform",
		"CRM Implementation",
		"ERP System Upgrade",
		"Business Intelligence Solution",
		"Cybersecurity Package",
		"Backup and Recovery",
		"Network Infrastructure",
		"VoIP Phone System",
		"Video Conferencing Setup",
		"Document Management System",
		"Workflow Automation",
		"Analytics Dashboard",
		"API Development",
		"Database Optimization",
		"Cloud Migration",
		"Disaster Recovery Plan",
		"Compliance Audit",
		"User Training Program",
		"Technical Support",
		"Maintenance Contract",
		"Upgrade Package",
		"Custom Integration",
		"Data Analytics",
		"Machine Learning Solution",
		"IoT Platform",
		"Blockchain Implementation",
		"AI Chatbot Development",
		"Predictive Analytics",
		"Real-time Monitoring",
		"Automated Testing",
		"DevOps Implementation",
		"Container Orchestration",
		"Microservices Architecture",
		"Serverless Implementation",
		"Edge Computing Solution",
		"5G Network Setup",
		"Virtual Reality Platform",
		"Augmented Reality App",
	}

	currencies := []string{"USD", "EUR", "GBP", "CAD", "AUD"}

	// Create 50 deals
	successCount := 0
	for i := 0; i < 50; i++ {
		// Generate random deal data
		dealName := dealNames[rand.Intn(len(dealNames))]
		amount := rand.Intn(500000) + 10000 // $10k to $510k
		currency := currencies[rand.Intn(len(currencies))]

		// Random stage
		stage := stages[rand.Intn(len(stages))]

		// Random user assignment (70% chance of being assigned)
		var assignedUserID *string
		if rand.Float32() < 0.7 && len(users) > 0 {
			user := users[rand.Intn(len(users))]
			assignedUserID = &user.ID
		}

		// Random company (80% chance of having a company)
		var companyID *string
		if rand.Float32() < 0.8 && len(companies) > 0 {
			company := companies[rand.Intn(len(companies))]
			companyID = &company.ID
		}

		// Random contact (60% chance of having a contact)
		var contactID *string
		if rand.Float32() < 0.6 && len(contacts) > 0 {
			contact := contacts[rand.Intn(len(contacts))]
			contactID = &contact.ID
		}

		// Random created by user
		createdBy := users[rand.Intn(len(users))].ID

		// Random expected close date (within next 6 months)
		expectedCloseDate := time.Now().AddDate(0, rand.Intn(6), rand.Intn(30))

		// For closed deals, set actual close date
		var actualCloseDate *time.Time
		if stage.Name == "Closed Won" || stage.Name == "Closed Lost" {
			actualCloseDate = &expectedCloseDate
		}

		// Insert deal
		query := `
			INSERT INTO deals (
				id, name, amount, probability, currency, expected_close_date, actual_close_date,
				pipeline_id, stage_id, assigned_user_id, company_id, contact_id, created_by,
				tenant_id, created_at, updated_at
			) VALUES (
				gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
			)
		`

		_, err := db.Exec(query,
			dealName, amount, stage.Probability, currency, expectedCloseDate, actualCloseDate,
			pipelineID, stage.ID, assignedUserID, companyID, contactID, createdBy, tenantID,
		)

		if err != nil {
			log.Printf("Failed to insert deal %d: %v", i+1, err)
			continue
		}

		successCount++
		if (i+1)%10 == 0 {
			fmt.Printf("Created %d deals...\n", i+1)
		}
	}

	fmt.Printf("\nSuccessfully created %d deals\n", successCount)

	// Show summary
	var totalDeals int
	err = db.QueryRow("SELECT COUNT(*) FROM deals WHERE tenant_id = $1", tenantID).Scan(&totalDeals)
	if err != nil {
		log.Fatal("Failed to count deals:", err)
	}

	fmt.Printf("Total deals in database: %d\n", totalDeals)

	// Show deals by stage
	fmt.Println("\nDeals by stage:")
	stageRows, err = db.Query(`
		SELECT s.name, COUNT(d.id) 
		FROM stages s 
		LEFT JOIN deals d ON s.id = d.stage_id AND d.tenant_id = $1
		WHERE s.pipeline_id = $2
		GROUP BY s.id, s.name, s."order"
		ORDER BY s."order"
	`, tenantID, pipelineID)
	if err != nil {
		log.Fatal("Failed to get deals by stage:", err)
	}
	defer stageRows.Close()

	for stageRows.Next() {
		var stageName string
		var count int
		err := stageRows.Scan(&stageName, &count)
		if err != nil {
			log.Fatal("Failed to scan stage count:", err)
		}
		fmt.Printf("  %s: %d deals\n", stageName, count)
	}

	// Show deals by assigned user
	fmt.Println("\nDeals by assigned user:")
	userRows, err = db.Query(`
		SELECT u.first_name || ' ' || u.last_name, COUNT(d.id)
		FROM users u
		LEFT JOIN deals d ON u.id = d.assigned_user_id AND d.tenant_id = $1
		WHERE u.tenant_id = $1
		GROUP BY u.id, u.first_name, u.last_name
		ORDER BY COUNT(d.id) DESC
	`, tenantID)
	if err != nil {
		log.Fatal("Failed to get deals by user:", err)
	}
	defer userRows.Close()

	for userRows.Next() {
		var userName string
		var count int
		err := userRows.Scan(&userName, &count)
		if err != nil {
			log.Fatal("Failed to scan user count:", err)
		}
		fmt.Printf("  %s: %d deals\n", userName, count)
	}

	fmt.Println("\nDeals seeding completed successfully!")
}

