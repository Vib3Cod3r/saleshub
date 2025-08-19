package main

import (
	"log"
	"saleshub-backend/config"
	"saleshub-backend/models"

	"github.com/google/uuid"
)

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
	var techIndustry models.Industry
	config.DB.Where("code = ? AND tenant_id = ?", "TECH", tenant.ID).First(&techIndustry)

	var healthcareIndustry models.Industry
	config.DB.Where("code = ? AND tenant_id = ?", "HEALTHCARE", tenant.ID).First(&healthcareIndustry)

	var financeIndustry models.Industry
	config.DB.Where("code = ? AND tenant_id = ?", "FINANCE", tenant.ID).First(&financeIndustry)

	var manufacturingIndustry models.Industry
	config.DB.Where("code = ? AND tenant_id = ?", "MANUFACTURING", tenant.ID).First(&manufacturingIndustry)

	var retailIndustry models.Industry
	config.DB.Where("code = ? AND tenant_id = ?", "RETAIL", tenant.ID).First(&retailIndustry)

	var smallSize models.CompanySize
	config.DB.Where("code = ? AND tenant_id = ?", "SMALL", tenant.ID).First(&smallSize)

	var mediumSize models.CompanySize
	config.DB.Where("code = ? AND tenant_id = ?", "MEDIUM", tenant.ID).First(&mediumSize)

	var largeSize models.CompanySize
	config.DB.Where("code = ? AND tenant_id = ?", "LARGE", tenant.ID).First(&largeSize)

	var enterpriseSize models.CompanySize
	config.DB.Where("code = ? AND tenant_id = ?", "ENTERPRISE", tenant.ID).First(&enterpriseSize)

	// Get phone and email types
	var workPhoneType models.PhoneNumberType
	config.DB.Where("code = ? AND tenant_id = ?", "WORK", tenant.ID).First(&workPhoneType)

	var workEmailType models.EmailAddressType
	config.DB.Where("code = ? AND tenant_id = ?", "WORK", tenant.ID).First(&workEmailType)

	// Sample companies with contact data
	companies := []struct {
		name     string
		website  string
		domain   string
		industry models.Industry
		size     models.CompanySize
		revenue  float64
		phone    string
		email    string
	}{
		{
			name:     "TechCorp Solutions",
			website:  "https://techcorp.com",
			domain:   "techcorp.com",
			industry: techIndustry,
			size:     mediumSize,
			revenue:  25000000,
			phone:    "+1 (555) 123-4567",
			email:    "info@techcorp.com",
		},
		{
			name:     "Global Finance Group",
			website:  "https://globalfinance.com",
			domain:   "globalfinance.com",
			industry: financeIndustry,
			size:     largeSize,
			revenue:  150000000,
			phone:    "+1 (555) 234-5678",
			email:    "contact@globalfinance.com",
		},
		{
			name:     "Legal Associates LLP",
			website:  "https://legalassociates.com",
			domain:   "legalassociates.com",
			industry: financeIndustry,
			size:     mediumSize,
			revenue:  45000000,
			phone:    "+1 (555) 345-6789",
			email:    "info@legalassociates.com",
		},
		{
			name:     "Food & Beverage Co",
			website:  "https://foodbeverage.com",
			domain:   "foodbeverage.com",
			industry: manufacturingIndustry,
			size:     largeSize,
			revenue:  75000000,
			phone:    "+1 (555) 456-7890",
			email:    "sales@foodbeverage.com",
		},
		{
			name:     "Consulting Experts",
			website:  "https://consultingexperts.com",
			domain:   "consultingexperts.com",
			industry: techIndustry,
			size:     smallSize,
			revenue:  12000000,
			phone:    "+1 (555) 567-8901",
			email:    "hello@consultingexperts.com",
		},
		{
			name:     "Digital Dynamics",
			website:  "https://digitaldynamics.com",
			domain:   "digitaldynamics.com",
			industry: techIndustry,
			size:     mediumSize,
			revenue:  35000000,
			phone:    "+1 (555) 678-9012",
			email:    "info@digitaldynamics.com",
		},
		{
			name:     "Retail Plus Stores",
			website:  "https://retailplus.com",
			domain:   "retailplus.com",
			industry: retailIndustry,
			size:     enterpriseSize,
			revenue:  200000000,
			phone:    "+1 (555) 789-0123",
			email:    "contact@retailplus.com",
		},
		{
			name:     "Healthcare Innovations",
			website:  "https://healthcareinnovations.com",
			domain:   "healthcareinnovations.com",
			industry: healthcareIndustry,
			size:     largeSize,
			revenue:  180000000,
			phone:    "+1 (555) 890-1234",
			email:    "info@healthcareinnovations.com",
		},
		{
			name:     "Manufacturing Solutions",
			website:  "https://manufacturingsolutions.com",
			domain:   "manufacturingsolutions.com",
			industry: manufacturingIndustry,
			size:     enterpriseSize,
			revenue:  300000000,
			phone:    "+1 (555) 901-2345",
			email:    "sales@manufacturingsolutions.com",
		},
		{
			name:     "Startup Ventures",
			website:  "https://startupventures.com",
			domain:   "startupventures.com",
			industry: techIndustry,
			size:     smallSize,
			revenue:  5000000,
			phone:    "+1 (555) 012-3456",
			email:    "hello@startupventures.com",
		},
	}

	for _, companyData := range companies {
		// Check if company already exists
		var existingCompany models.Company
		if err := config.DB.Where("name = ? AND tenant_id = ?", companyData.name, tenant.ID).First(&existingCompany).Error; err != nil {
			// Create new company
			company := models.Company{
				ID:         uuid.New().String(),
				Name:       companyData.name,
				Website:    &companyData.website,
				Domain:     &companyData.domain,
				IndustryID: companyData.industry.ID,
				SizeID:     companyData.size.ID,
				Revenue:    &companyData.revenue,
				TenantID:   tenant.ID,
			}

			if err := config.DB.Create(&company).Error; err != nil {
				log.Printf("Failed to create company %s: %v", companyData.name, err)
				continue
			}

			// Create a primary contact for the company
			contact := models.Contact{
				ID:        uuid.New().String(),
				FirstName: "Primary",
				LastName:  "Contact",
				Title:     &[]string{"Manager"}[0],
				CompanyID: &company.ID,
				TenantID:  tenant.ID,
			}

			if err := config.DB.Create(&contact).Error; err != nil {
				log.Printf("Failed to create contact for %s: %v", companyData.name, err)
			} else {
				// Create phone number for the contact
				phoneNumber := models.PhoneNumber{
					ID:         uuid.New().String(),
					Number:     companyData.phone,
					TypeID:     &workPhoneType.ID,
					IsPrimary:  true,
					EntityID:   contact.ID,
					EntityType: "Contact",
					TenantID:   tenant.ID,
				}

				if err := config.DB.Create(&phoneNumber).Error; err != nil {
					log.Printf("Failed to create phone number for %s: %v", companyData.name, err)
				}

				// Create email address for the contact
				emailAddress := models.EmailAddress{
					ID:         uuid.New().String(),
					Email:      companyData.email,
					TypeID:     &workEmailType.ID,
					IsPrimary:  true,
					EntityID:   contact.ID,
					EntityType: "Contact",
					TenantID:   tenant.ID,
				}

				if err := config.DB.Create(&emailAddress).Error; err != nil {
					log.Printf("Failed to create email address for %s: %v", companyData.name, err)
				}

				log.Printf("Created contact with phone and email for %s", companyData.name)
			}

			log.Printf("Created company: %s with phone: %s and email: %s", companyData.name, companyData.phone, companyData.email)
		} else {
			log.Printf("Company already exists: %s", companyData.name)
		}
	}

	log.Println("")
	log.Println("=== COMPANIES WITH CONTACT DATA CREATED ===")
	log.Printf("• %d companies with phone numbers and email addresses", len(companies))
	log.Println("")
	log.Println("You can now test the companies page with real contact data!")
}
