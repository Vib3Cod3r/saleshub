package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

type DealRecord struct {
	ID                string
	Name              string
	Amount            float64
	Probability       int
	Currency          string
	ExpectedCloseDate *time.Time
	ActualCloseDate   *time.Time
	PipelineName      string
	StageName         string
	AssignedUserName  *string
	CompanyName       *string
	ContactName       *string
	CreatedBy         string
	CreatedAt         time.Time
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

	// Query deals with all related data
	query := `
		SELECT 
			d.id,
			d.name,
			d.amount,
			d.probability,
			d.currency,
			d.expected_close_date,
			d.actual_close_date,
			p.name as pipeline_name,
			s.name as stage_name,
			CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
			c.name as company_name,
			CONCAT(co.first_name, ' ', co.last_name) as contact_name,
			CONCAT(cb.first_name, ' ', cb.last_name) as created_by,
			d.created_at
		FROM deals d
		LEFT JOIN pipelines p ON d.pipeline_id = p.id
		LEFT JOIN stages s ON d.stage_id = s.id
		LEFT JOIN users u ON d.assigned_user_id::uuid = u.id
		LEFT JOIN companies c ON d.company_id::uuid = c.id
		LEFT JOIN contacts co ON d.contact_id::uuid = co.id
		LEFT JOIN users cb ON d.created_by::uuid = cb.id
		WHERE d.tenant_id = $1
		ORDER BY d.created_at DESC
		LIMIT 20
	`

	rows, err := db.Query(query, tenantID)
	if err != nil {
		log.Fatal("Failed to query deals:", err)
	}
	defer rows.Close()

	var deals []DealRecord
	for rows.Next() {
		var deal DealRecord
		err := rows.Scan(
			&deal.ID,
			&deal.Name,
			&deal.Amount,
			&deal.Probability,
			&deal.Currency,
			&deal.ExpectedCloseDate,
			&deal.ActualCloseDate,
			&deal.PipelineName,
			&deal.StageName,
			&deal.AssignedUserName,
			&deal.CompanyName,
			&deal.ContactName,
			&deal.CreatedBy,
			&deal.CreatedAt,
		)
		if err != nil {
			log.Fatal("Failed to scan deal:", err)
		}
		deals = append(deals, deal)
	}

	// Print header
	fmt.Printf("\n%-40s %-12s %-8s %-8s %-12s %-15s %-15s %-20s %-20s %-15s\n",
		"NAME", "AMOUNT", "PROB", "CURR", "STAGE", "ASSIGNED TO", "COMPANY", "CONTACT", "CREATED BY", "EXPECTED CLOSE")
	fmt.Println(string(make([]byte, 200, 200)))
	for i := 0; i < 200; i++ {
		fmt.Print("-")
	}
	fmt.Println()

	// Print deals
	for _, deal := range deals {
		assignedUser := "Unassigned"
		if deal.AssignedUserName != nil {
			assignedUser = *deal.AssignedUserName
		}

		company := "No Company"
		if deal.CompanyName != nil {
			company = *deal.CompanyName
		}

		contact := "No Contact"
		if deal.ContactName != nil {
			contact = *deal.ContactName
		}

		expectedClose := "Not Set"
		if deal.ExpectedCloseDate != nil {
			expectedClose = deal.ExpectedCloseDate.Format("2006-01-02")
		}

		// Truncate long names
		name := deal.Name
		if len(name) > 38 {
			name = name[:35] + "..."
		}

		assignedUserShort := assignedUser
		if len(assignedUserShort) > 13 {
			assignedUserShort = assignedUserShort[:10] + "..."
		}

		companyShort := company
		if len(companyShort) > 18 {
			companyShort = companyShort[:15] + "..."
		}

		contactShort := contact
		if len(contactShort) > 18 {
			contactShort = contactShort[:15] + "..."
		}

		fmt.Printf("%-40s %-12s %-8d %-8s %-12s %-15s %-20s %-20s %-15s %-15s\n",
			name,
			fmt.Sprintf("%s %.0f", deal.Currency, deal.Amount),
			deal.Probability,
			deal.Currency,
			deal.StageName,
			assignedUserShort,
			companyShort,
			contactShort,
			deal.CreatedBy,
			expectedClose,
		)
	}

	// Show summary statistics
	fmt.Println("\n" + string(make([]byte, 200, 200)))
	for i := 0; i < 200; i++ {
		fmt.Print("-")
	}
	fmt.Println()

	// Count deals by stage
	fmt.Println("\nDeals by Stage:")
	stageQuery := `
		SELECT s.name, COUNT(d.id)
		FROM stages s
		LEFT JOIN deals d ON s.id = d.stage_id AND d.tenant_id = $1
		WHERE s.pipeline_id = (SELECT id FROM pipelines WHERE tenant_id = $1 LIMIT 1)
		GROUP BY s.id, s.name, s."order"
		ORDER BY s."order"
	`
	stageRows, err := db.Query(stageQuery, tenantID)
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

	// Count deals by assigned user
	fmt.Println("\nDeals by Assigned User:")
	userQuery := `
		SELECT CONCAT(u.first_name, ' ', u.last_name), COUNT(d.id)
		FROM users u
		LEFT JOIN deals d ON u.id = d.assigned_user_id AND d.tenant_id = $1
		WHERE u.tenant_id = $1
		GROUP BY u.id, u.first_name, u.last_name
		ORDER BY COUNT(d.id) DESC
	`
	userRows, err := db.Query(userQuery, tenantID)
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

	// Total deals
	var totalDeals int
	err = db.QueryRow("SELECT COUNT(*) FROM deals WHERE tenant_id = $1", tenantID).Scan(&totalDeals)
	if err != nil {
		log.Fatal("Failed to count total deals:", err)
	}
	fmt.Printf("\nTotal deals in database: %d\n", totalDeals)

	// Deals with assignments
	var assignedDeals int
	err = db.QueryRow("SELECT COUNT(*) FROM deals WHERE tenant_id = $1 AND assigned_user_id IS NOT NULL", tenantID).Scan(&assignedDeals)
	if err != nil {
		log.Fatal("Failed to count assigned deals:", err)
	}
	fmt.Printf("Deals with assigned users: %d (%.1f%%)\n", assignedDeals, float64(assignedDeals)/float64(totalDeals)*100)

	var companyDeals int
	err = db.QueryRow("SELECT COUNT(*) FROM deals WHERE tenant_id = $1 AND company_id IS NOT NULL", tenantID).Scan(&companyDeals)
	if err != nil {
		log.Fatal("Failed to count company deals:", err)
	}
	fmt.Printf("Deals with companies: %d (%.1f%%)\n", companyDeals, float64(companyDeals)/float64(totalDeals)*100)

	var contactDeals int
	err = db.QueryRow("SELECT COUNT(*) FROM deals WHERE tenant_id = $1 AND contact_id IS NOT NULL", tenantID).Scan(&contactDeals)
	if err != nil {
		log.Fatal("Failed to count contact deals:", err)
	}
	fmt.Printf("Deals with contacts: %d (%.1f%%)\n", contactDeals, float64(contactDeals)/float64(totalDeals)*100)

	fmt.Println("\nDeal records display completed!")
}
