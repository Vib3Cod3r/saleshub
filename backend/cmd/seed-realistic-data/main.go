package main

import (
	"log"
	"math/rand"
	"saleshub-backend/config"
	"saleshub-backend/models"

	"github.com/google/uuid"
)

// Realistic data structures
type CompanyData struct {
	name     string
	website  string
	domain   string
	industry string
	size     string
	revenue  float64
	phone    string
	email    string
	address  AddressData
}

type ContactData struct {
	firstName  string
	lastName   string
	title      string
	department string
	email      string
	phone      string
	leadStatus string
}

type AddressData struct {
	street  string
	city    string
	state   string
	zipCode string
	country string
}

func main() {
	// Initialize database
	config.InitDatabase()
	config.AutoMigrate()

	// Get the default tenant
	var tenant models.Tenant
	if err := config.DB.Where("name = ?", "Default Organization").First(&tenant).Error; err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	// Get lookup data
	industries := getIndustries(tenant.ID)
	sizes := getCompanySizes(tenant.ID)
	leadStatuses := getLeadStatuses(tenant.ID)
	phoneTypes := getPhoneTypes(tenant.ID)
	emailTypes := getEmailTypes(tenant.ID)

	// Realistic company data
	companies := []CompanyData{
		{
			name:     "Acme Corporation",
			website:  "https://acme.com",
			domain:   "acme.com",
			industry: "TECH",
			size:     "LARGE",
			revenue:  85000000,
			phone:    "+1 (555) 123-4567",
			email:    "info@acme.com",
			address:  AddressData{"123 Business Ave", "San Francisco", "CA", "94105", "USA"},
		},
		{
			name:     "Global Tech Solutions",
			website:  "https://globaltech.com",
			domain:   "globaltech.com",
			industry: "TECH",
			size:     "ENTERPRISE",
			revenue:  250000000,
			phone:    "+1 (555) 234-5678",
			email:    "contact@globaltech.com",
			address:  AddressData{"456 Innovation Dr", "Austin", "TX", "78701", "USA"},
		},
		{
			name:     "Meridian Healthcare",
			website:  "https://meridianhealth.com",
			domain:   "meridianhealth.com",
			industry: "HEALTHCARE",
			size:     "LARGE",
			revenue:  180000000,
			phone:    "+1 (555) 345-6789",
			email:    "info@meridianhealth.com",
			address:  AddressData{"789 Medical Center Blvd", "Boston", "MA", "02108", "USA"},
		},
		{
			name:     "Summit Financial Group",
			website:  "https://summitfinancial.com",
			domain:   "summitfinancial.com",
			industry: "FINANCE",
			size:     "ENTERPRISE",
			revenue:  450000000,
			phone:    "+1 (555) 456-7890",
			email:    "hello@summitfinancial.com",
			address:  AddressData{"321 Wall Street", "New York", "NY", "10005", "USA"},
		},
		{
			name:     "Precision Manufacturing Co",
			website:  "https://precisionmfg.com",
			domain:   "precisionmfg.com",
			industry: "MANUFACTURING",
			size:     "LARGE",
			revenue:  120000000,
			phone:    "+1 (555) 567-8901",
			email:    "sales@precisionmfg.com",
			address:  AddressData{"654 Industrial Way", "Detroit", "MI", "48201", "USA"},
		},
		{
			name:     "Urban Retail Partners",
			website:  "https://urbanretail.com",
			domain:   "urbanretail.com",
			industry: "RETAIL",
			size:     "MEDIUM",
			revenue:  75000000,
			phone:    "+1 (555) 678-9012",
			email:    "info@urbanretail.com",
			address:  AddressData{"987 Commerce St", "Chicago", "IL", "60601", "USA"},
		},
		{
			name:     "Nexus Consulting",
			website:  "https://nexusconsulting.com",
			domain:   "nexusconsulting.com",
			industry: "TECH",
			size:     "SMALL",
			revenue:  25000000,
			phone:    "+1 (555) 789-0123",
			email:    "hello@nexusconsulting.com",
			address:  AddressData{"147 Consulting Ave", "Seattle", "WA", "98101", "USA"},
		},
		{
			name:     "Blue Horizon Energy",
			website:  "https://bluehorizon.com",
			domain:   "bluehorizon.com",
			industry: "MANUFACTURING",
			size:     "LARGE",
			revenue:  300000000,
			phone:    "+1 (555) 890-1234",
			email:    "contact@bluehorizon.com",
			address:  AddressData{"258 Energy Blvd", "Houston", "TX", "77002", "USA"},
		},
		{
			name:     "Silver Lining Insurance",
			website:  "https://silverlining.com",
			domain:   "silverlining.com",
			industry: "FINANCE",
			size:     "MEDIUM",
			revenue:  95000000,
			phone:    "+1 (555) 901-2345",
			email:    "info@silverlining.com",
			address:  AddressData{"369 Insurance Dr", "Phoenix", "AZ", "85001", "USA"},
		},
		{
			name:     "Green Earth Solutions",
			website:  "https://greenearth.com",
			domain:   "greenearth.com",
			industry: "TECH",
			size:     "SMALL",
			revenue:  15000000,
			phone:    "+1 (555) 012-3456",
			email:    "hello@greenearth.com",
			address:  AddressData{"741 Eco Way", "Portland", "OR", "97201", "USA"},
		},
	}

	// Realistic contact data
	contacts := []ContactData{
		{"Sarah", "Johnson", "Chief Executive Officer", "Executive", "sarah.johnson@acme.com", "+1 (555) 123-4567", "QUALIFIED"},
		{"Michael", "Chen", "Chief Technology Officer", "Technology", "michael.chen@globaltech.com", "+1 (555) 234-5678", "QUALIFIED"},
		{"Emily", "Rodriguez", "Chief Medical Officer", "Medical", "emily.rodriguez@meridianhealth.com", "+1 (555) 345-6789", "CONTACTED"},
		{"David", "Thompson", "Chief Financial Officer", "Finance", "david.thompson@summitfinancial.com", "+1 (555) 456-7890", "QUALIFIED"},
		{"Lisa", "Wang", "Operations Director", "Operations", "lisa.wang@precisionmfg.com", "+1 (555) 567-8901", "NEW"},
		{"James", "Wilson", "Retail Manager", "Sales", "james.wilson@urbanretail.com", "+1 (555) 678-9012", "CONTACTED"},
		{"Jennifer", "Davis", "Senior Consultant", "Consulting", "jennifer.davis@nexusconsulting.com", "+1 (555) 789-0123", "QUALIFIED"},
		{"Robert", "Brown", "Energy Director", "Energy", "robert.brown@bluehorizon.com", "+1 (555) 890-1234", "NEW"},
		{"Amanda", "Garcia", "Claims Manager", "Claims", "amanda.garcia@silverlining.com", "+1 (555) 901-2345", "CONTACTED"},
		{"Christopher", "Lee", "Sustainability Manager", "Sustainability", "christopher.lee@greenearth.com", "+1 (555) 012-3456", "QUALIFIED"},
		{"Jessica", "Martinez", "VP of Sales", "Sales", "jessica.martinez@acme.com", "+1 (555) 123-4568", "CONTACTED"},
		{"Kevin", "Taylor", "Software Architect", "Engineering", "kevin.taylor@globaltech.com", "+1 (555) 234-5679", "QUALIFIED"},
		{"Nicole", "Anderson", "Nursing Director", "Nursing", "nicole.anderson@meridianhealth.com", "+1 (555) 345-6790", "NEW"},
		{"Andrew", "Jackson", "Investment Manager", "Investments", "andrew.jackson@summitfinancial.com", "+1 (555) 456-7891", "QUALIFIED"},
		{"Rachel", "White", "Production Manager", "Production", "rachel.white@precisionmfg.com", "+1 (555) 567-8902", "CONTACTED"},
	}

	// Create companies and contacts
	for i, companyData := range companies {
		// Create company
		company := createCompany(companyData, industries, sizes, phoneTypes, emailTypes, tenant.ID)

		// Create primary contact for company
		if i < len(contacts) {
			createContact(contacts[i], company.ID, leadStatuses, phoneTypes, emailTypes, tenant.ID)
		}

		// Create additional contacts for larger companies
		if companyData.size == "LARGE" || companyData.size == "ENTERPRISE" {
			additionalContacts := getAdditionalContacts(companyData.name, companyData.domain)
			for _, contactData := range additionalContacts {
				createContact(contactData, company.ID, leadStatuses, phoneTypes, emailTypes, tenant.ID)
			}
		}
	}

	log.Println("")
	log.Println("=== REALISTIC DATA CREATED ===")
	log.Printf("• %d companies with full contact information", len(companies))
	log.Printf("• %d+ contacts with realistic names, titles, and contact details", len(contacts))
	log.Println("• Realistic phone numbers, email addresses, and addresses")
	log.Println("• Proper lead statuses and activity timestamps")
	log.Println("")
	log.Println("You can now test the contacts and companies pages with comprehensive data!")
}

func getIndustries(tenantID string) map[string]models.Industry {
	industries := make(map[string]models.Industry)
	var industryList []models.Industry
	config.DB.Where("tenant_id = ?", tenantID).Find(&industryList)

	for _, industry := range industryList {
		industries[industry.Code] = industry
	}
	return industries
}

func getCompanySizes(tenantID string) map[string]models.CompanySize {
	sizes := make(map[string]models.CompanySize)
	var sizeList []models.CompanySize
	config.DB.Where("tenant_id = ?", tenantID).Find(&sizeList)

	for _, size := range sizeList {
		sizes[size.Code] = size
	}
	return sizes
}

func getLeadStatuses(tenantID string) []models.LeadStatus {
	var statuses []models.LeadStatus
	config.DB.Where("tenant_id = ?", tenantID).Find(&statuses)
	return statuses
}

func getPhoneTypes(tenantID string) map[string]models.PhoneNumberType {
	types := make(map[string]models.PhoneNumberType)
	var typeList []models.PhoneNumberType
	config.DB.Where("tenant_id = ?", tenantID).Find(&typeList)

	for _, phoneType := range typeList {
		types[phoneType.Code] = phoneType
	}
	return types
}

func getEmailTypes(tenantID string) map[string]models.EmailAddressType {
	types := make(map[string]models.EmailAddressType)
	var typeList []models.EmailAddressType
	config.DB.Where("tenant_id = ?", tenantID).Find(&typeList)

	for _, emailType := range typeList {
		types[emailType.Code] = emailType
	}
	return types
}

func createCompany(data CompanyData, industries map[string]models.Industry, sizes map[string]models.CompanySize, phoneTypes map[string]models.PhoneNumberType, emailTypes map[string]models.EmailAddressType, tenantID string) models.Company {
	// Check if company already exists
	var existingCompany models.Company
	if err := config.DB.Where("name = ? AND tenant_id = ?", data.name, tenantID).First(&existingCompany).Error; err == nil {
		log.Printf("Company already exists: %s", data.name)
		return existingCompany
	}

	// Get a random user to assign as owner
	var users []models.User
	config.DB.Where("tenant_id = ?", tenantID).Find(&users)
	var assignedTo *string
	if len(users) > 0 {
		randomUser := users[rand.Intn(len(users))]
		assignedTo = &randomUser.ID
	}

	company := models.Company{
		ID:         uuid.New().String(),
		Name:       data.name,
		Website:    &data.website,
		Domain:     &data.domain,
		IndustryID: industries[data.industry].ID,
		SizeID:     sizes[data.size].ID,
		Revenue:    &data.revenue,
		AssignedTo: assignedTo,
		TenantID:   tenantID,
	}

	if err := config.DB.Create(&company).Error; err != nil {
		log.Printf("Failed to create company %s: %v", data.name, err)
		return company
	}

	// Create address for company
	createAddress(data.address, company.ID, "Company", tenantID)

	log.Printf("Created company: %s", data.name)
	return company
}

func createContact(data ContactData, companyID string, leadStatuses []models.LeadStatus, phoneTypes map[string]models.PhoneNumberType, emailTypes map[string]models.EmailAddressType, tenantID string) {
	// Check if contact already exists
	var existingContact models.Contact
	if err := config.DB.Where("first_name = ? AND last_name = ? AND company_id = ? AND tenant_id = ?",
		data.firstName, data.lastName, companyID, tenantID).First(&existingContact).Error; err == nil {
		log.Printf("Contact already exists: %s %s", data.firstName, data.lastName)
		return
	}

	// Get random lead status
	leadStatus := leadStatuses[rand.Intn(len(leadStatuses))]

	contact := models.Contact{
		ID:         uuid.New().String(),
		FirstName:  data.firstName,
		LastName:   data.lastName,
		Title:      &data.title,
		Department: &data.department,
		CompanyID:  &companyID,
		TenantID:   tenantID,
	}

	if err := config.DB.Create(&contact).Error; err != nil {
		log.Printf("Failed to create contact %s %s: %v", data.firstName, data.lastName, err)
		return
	}

	// Create phone number
	if workPhone, exists := phoneTypes["WORK"]; exists {
		phoneNumber := models.PhoneNumber{
			ID:         uuid.New().String(),
			Number:     data.phone,
			TypeID:     &workPhone.ID,
			IsPrimary:  true,
			EntityID:   contact.ID,
			EntityType: "Contact",
			TenantID:   tenantID,
		}
		config.DB.Create(&phoneNumber)
	}

	// Create email address
	if workEmail, exists := emailTypes["WORK"]; exists {
		emailAddress := models.EmailAddress{
			ID:         uuid.New().String(),
			Email:      data.email,
			TypeID:     &workEmail.ID,
			IsPrimary:  true,
			EntityID:   contact.ID,
			EntityType: "Contact",
			TenantID:   tenantID,
		}
		config.DB.Create(&emailAddress)
	}

	// Create lead with status
	createLead(contact, leadStatus, tenantID)

	log.Printf("Created contact: %s %s (%s) at %s", data.firstName, data.lastName, data.title, data.email)
}

func createAddress(data AddressData, entityID string, entityType string, tenantID string) {
	address := models.Address{
		ID:         uuid.New().String(),
		Street1:    &data.street,
		City:       &data.city,
		State:      &data.state,
		PostalCode: &data.zipCode,
		Country:    &data.country,
		IsPrimary:  true,
		EntityID:   entityID,
		EntityType: entityType,
		TenantID:   tenantID,
	}
	config.DB.Create(&address)
}

func createLead(contact models.Contact, status models.LeadStatus, tenantID string) {
	lead := models.Lead{
		ID:        uuid.New().String(),
		FirstName: &contact.FirstName,
		LastName:  &contact.LastName,
		Title:     contact.Title,
		StatusID:  status.ID,
		CompanyID: *contact.CompanyID,
		ContactID: contact.ID,
		TenantID:  tenantID,
	}
	config.DB.Create(&lead)
}

func getAdditionalContacts(companyName, domain string) []ContactData {
	// Generate additional realistic contacts for larger companies
	additionalContacts := []ContactData{
		{"Alex", "Turner", "Marketing Director", "Marketing", "alex.turner@" + domain, "+1 (555) 111-2222", "NEW"},
		{"Maria", "Gonzalez", "HR Manager", "Human Resources", "maria.gonzalez@" + domain, "+1 (555) 222-3333", "CONTACTED"},
		{"Daniel", "Kim", "Product Manager", "Product", "daniel.kim@" + domain, "+1 (555) 333-4444", "QUALIFIED"},
	}
	return additionalContacts
}
