package main

import (
	"fmt"
	"log"
	"math/rand"
	"saleshub-backend/config"
	"saleshub-backend/models"
	"strings"
	"time"
)

// Helper functions for generating realistic data
func stringPtr(s string) *string {
	return &s
}

func float64Ptr(f float64) *float64 {
	return &f
}

func generatePhoneNumber() string {
	areaCodes := []string{"212", "415", "312", "404", "305", "713", "602", "303", "206", "617", "312", "214", "713", "404", "305"}
	areaCode := areaCodes[rand.Intn(len(areaCodes))]
	prefix := fmt.Sprintf("%03d", rand.Intn(900)+100)
	line := fmt.Sprintf("%04d", rand.Intn(9000)+1000)
	return fmt.Sprintf("(%s) %s-%s", areaCode, prefix, line)
}

func generateEmail(firstName, lastName string) string {
	domains := []string{"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"}
	domain := domains[rand.Intn(len(domains))]
	variations := []string{
		fmt.Sprintf("%s.%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s_%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s%s%d", strings.ToLower(firstName), strings.ToLower(lastName), rand.Intn(999)),
	}
	return fmt.Sprintf("%s@%s", variations[rand.Intn(len(variations))], domain)
}

func generateWorkEmail(firstName, lastName, companyID string) string {
	// Get company domain
	var company models.Company
	if err := config.DB.First(&company, companyID).Error; err == nil && company.Domain != nil {
		return fmt.Sprintf("%s.%s@%s", strings.ToLower(firstName), strings.ToLower(lastName), *company.Domain)
	}
	// Fallback domains
	workDomains := []string{"company.com", "corp.com", "business.com", "enterprise.com"}
	domain := workDomains[rand.Intn(len(workDomains))]
	return fmt.Sprintf("%s.%s@%s", strings.ToLower(firstName), strings.ToLower(lastName), domain)
}

func generateStreetAddress() string {
	numbers := []string{"123", "456", "789", "321", "654", "987", "111", "222", "333", "444", "555", "666", "777", "888", "999"}
	streets := []string{"Main St", "Oak Ave", "Pine Rd", "Elm St", "Maple Dr", "Cedar Ln", "Washington Blvd", "Park Ave", "Broadway", "5th Ave", "Madison Ave", "Lexington Ave", "Park Place", "Central Ave", "Riverside Dr"}
	number := numbers[rand.Intn(len(numbers))]
	street := streets[rand.Intn(len(streets))]
	return fmt.Sprintf("%s %s", number, street)
}

func generateCity() string {
	cities := []string{"New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Atlanta", "Kansas City", "Long Beach", "Colorado Springs", "Raleigh", "Miami", "Virginia Beach", "Omaha", "Oakland", "Minneapolis", "Tulsa", "Arlington", "Tampa", "New Orleans", "Wichita"}
	return cities[rand.Intn(len(cities))]
}

func generateState() string {
	states := []string{"NY", "CA", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI", "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "CO", "MN", "WI", "AL", "SC", "LA", "KY", "OR", "OK", "CT", "UT", "IA", "NV", "AR", "MS", "KS", "NE", "ID", "WV", "HI", "NH", "ME", "RI", "MT", "DE", "SD", "ND", "AK", "VT", "WY"}
	return states[rand.Intn(len(states))]
}

func generatePostalCode() string {
	return fmt.Sprintf("%05d", rand.Intn(90000)+10000)
}

func generateUsername(firstName, lastName string) string {
	variations := []string{
		fmt.Sprintf("%s%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s.%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s_%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s%s%d", strings.ToLower(firstName), strings.ToLower(lastName), rand.Intn(999)),
	}
	return variations[rand.Intn(len(variations))]
}

func generateLinkedInURL(firstName, lastName string) string {
	username := generateUsername(firstName, lastName)
	return fmt.Sprintf("https://linkedin.com/in/%s", username)
}

func generateTwitterURL(firstName, lastName string) string {
	username := generateUsername(firstName, lastName)
	return fmt.Sprintf("https://twitter.com/%s", username)
}

func generateFacebookURL(firstName, lastName string) string {
	username := generateUsername(firstName, lastName)
	return fmt.Sprintf("https://facebook.com/%s", username)
}

func generateInstagramURL(firstName, lastName string) string {
	username := generateUsername(firstName, lastName)
	return fmt.Sprintf("https://instagram.com/%s", username)
}

func main() {
	// Initialize database
	config.InitDatabase()
	config.AutoMigrate()

	// Set random seed
	rand.Seed(time.Now().UnixNano())

	// Get the default tenant
	var tenant models.Tenant
	if err := config.DB.Where("subdomain = ?", "default").First(&tenant).Error; err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	// Fetch lookup data
	var industries []models.Industry
	config.DB.Where("tenant_id = ?", tenant.ID).Find(&industries)

	var companySizes []models.CompanySize
	config.DB.Where("tenant_id = ?", tenant.ID).Find(&companySizes)

	var phoneTypes []models.PhoneNumberType
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&phoneTypes).Error; err != nil {
		log.Printf("Error fetching phone types: %v", err)
	} else {
		log.Printf("Found %d phone types", len(phoneTypes))
	}

	var emailTypes []models.EmailAddressType
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&emailTypes).Error; err != nil {
		log.Printf("Error fetching email types: %v", err)
	} else {
		log.Printf("Found %d email types", len(emailTypes))
	}

	var addressTypes []models.AddressType
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&addressTypes).Error; err != nil {
		log.Printf("Error fetching address types: %v", err)
	} else {
		log.Printf("Found %d address types", len(addressTypes))
	}

	var socialMediaTypes []models.SocialMediaType
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&socialMediaTypes).Error; err != nil {
		log.Printf("Error fetching social media types: %v", err)
	} else {
		log.Printf("Found %d social media types", len(socialMediaTypes))
	}

	// Create 15 diverse companies
	companyNames := []string{
		"TechCorp Solutions", "HealthFirst Medical", "Global Finance Group", "Innovation Manufacturing", "Retail Plus Stores",
		"Digital Dynamics", "Green Energy Corp", "Creative Marketing Agency", "Legal Associates LLP", "Educational Excellence",
		"Transportation Solutions", "Real Estate Partners", "Consulting Experts", "Food & Beverage Co", "Entertainment Studios",
	}

	companyDomains := []string{
		"techcorp.com", "healthfirst.com", "globalfinance.com", "innovationmfg.com", "retailplus.com",
		"digitaldynamics.com", "greenenergy.com", "creativemarketing.com", "legalassociates.com", "educationalexcellence.com",
		"transportationsolutions.com", "realestatepartners.com", "consultingexperts.com", "foodbeverage.com", "entertainmentstudios.com",
	}

	companies := []models.Company{}
	for i, name := range companyNames {
		website := fmt.Sprintf("https://%s", companyDomains[i])
		domain := companyDomains[i]
		revenue := float64(rand.Intn(100000000) + 1000000) // 1M to 100M

		company := models.Company{
			Name:       name,
			Website:    &website,
			Domain:     &domain,
			IndustryID: industries[rand.Intn(len(industries))].ID,
			SizeID:     companySizes[rand.Intn(len(companySizes))].ID,
			Revenue:    &revenue,
			TenantID:   tenant.ID,
		}
		companies = append(companies, company)
	}

	// Create companies
	for i := range companies {
		if err := config.DB.Create(&companies[i]).Error; err != nil {
			log.Printf("Warning: Failed to create company %s: %v", companies[i].Name, err)
		} else {
			log.Printf("Created company: %s", companies[i].Name)
		}
	}

	// Create 50 comprehensive contacts
	firstNames := []string{
		"Sarah", "Michael", "Emily", "David", "Lisa", "Robert", "Jennifer", "Christopher", "Amanda", "James",
		"Maria", "Kevin", "Rachel", "Thomas", "Nicole", "Daniel", "Stephanie", "Andrew", "Jessica", "Ryan",
		"Ashley", "Matthew", "Lauren", "Joshua", "Megan", "Justin", "Hannah", "Brandon", "Kayla", "Tyler",
		"Alexandra", "Zachary", "Victoria", "Nathan", "Samantha", "Eric", "Rebecca", "Adam", "Michelle", "Steven",
		"Amber", "Timothy", "Danielle", "Kyle", "Brittany", "Jeffrey", "Courtney", "Mark", "Tiffany", "Brian",
	}

	lastNames := []string{
		"Johnson", "Chen", "Rodriguez", "Thompson", "Wang", "Anderson", "Martinez", "Wilson", "Taylor", "Brown",
		"Garcia", "Lee", "Davis", "Miller", "White", "Clark", "Lewis", "Hall", "Allen", "Young",
		"King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson",
		"Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards",
		"Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy",
	}

	titles := []string{
		"Chief Executive Officer", "Chief Technology Officer", "Chief Financial Officer", "Chief Marketing Officer", "Chief Operating Officer",
		"Senior Software Engineer", "Product Manager", "Sales Director", "Marketing Manager", "Human Resources Director",
		"Operations Manager", "Quality Assurance Specialist", "Business Analyst", "Project Manager", "Data Scientist",
		"UX Designer", "DevOps Engineer", "Financial Analyst", "Legal Counsel", "Customer Success Manager",
		"Research & Development Lead", "Supply Chain Coordinator", "Risk Analyst", "Compliance Officer", "Production Supervisor",
		"Investment Manager", "Medical Director", "Nurse Practitioner", "Physician Assistant", "Store Manager",
		"Assistant Manager", "Sales Associate", "Marketing Specialist", "Account Executive", "Business Development Manager",
		"Technical Lead", "System Administrator", "Network Engineer", "Database Administrator", "Security Specialist",
		"Content Strategist", "Social Media Manager", "Event Coordinator", "Public Relations Manager", "Brand Manager",
		"Financial Controller", "Tax Specialist", "Auditor", "Investment Analyst", "Portfolio Manager",
	}

	departments := []string{
		"Executive", "Technology", "Finance", "Marketing", "Operations", "Engineering", "Product", "Sales", "Human Resources",
		"Quality Assurance", "Business Development", "Project Management", "Data Science", "Design", "DevOps",
		"Legal", "Customer Success", "Research & Development", "Supply Chain", "Risk Management", "Compliance",
		"Production", "Investment", "Medical", "Nursing", "Retail", "Administration", "Strategy", "Communications",
		"Public Relations", "Brand Management", "Accounting", "Tax", "Audit", "Portfolio Management",
	}

	sources := []string{
		"Website Contact Form", "LinkedIn", "Referral", "Conference", "Cold Outreach", "Trade Show", "Job Board",
		"Direct Contact", "Social Media", "Employee Referral", "Professional Network", "Industry Event",
		"Supplier Database", "Internal Promotion", "Portfolio Website", "GitHub Profile", "Medical Conference",
		"Regulatory Contact", "Manufacturing Expo", "Walk-in Application", "Email Campaign", "Webinar",
		"Partner Referral", "Alumni Network", "Professional Association", "Online Directory", "Press Release",
		"Trade Publication", "Award Ceremony", "Charity Event", "University Career Fair", "Industry Conference",
		"Client Referral", "Vendor Introduction", "Competitor Analysis", "Market Research", "Social Networking",
		"Online Advertisement", "Content Marketing", "SEO", "Paid Search", "Display Advertising", "Retargeting",
		"Affiliate Marketing", "Influencer Partnership", "Podcast Interview", "Guest Blog Post", "Speaking Engagement",
	}

	contacts := []models.Contact{}
	for i := 0; i < 50; i++ {
		firstName := firstNames[i%len(firstNames)]
		lastName := lastNames[i%len(lastNames)]
		title := titles[i%len(titles)]
		department := departments[i%len(departments)]
		source := sources[i%len(sources)]
		companyIndex := i % len(companies)

		contact := models.Contact{
			FirstName:      firstName,
			LastName:       lastName,
			Title:          &title,
			Department:     &department,
			CompanyID:      companies[companyIndex].ID,
			OriginalSource: &source,
			EmailOptIn:     rand.Float32() > 0.3, // 70% opt-in rate
			SMSOptIn:       rand.Float32() > 0.5, // 50% opt-in rate
			CallOptIn:      rand.Float32() > 0.4, // 60% opt-in rate
			TenantID:       tenant.ID,
		}
		contacts = append(contacts, contact)
	}

	// Create contacts
	for i := range contacts {
		if err := config.DB.Create(&contacts[i]).Error; err != nil {
			log.Printf("Warning: Failed to create contact %s %s: %v", contacts[i].FirstName, contacts[i].LastName, err)
		} else {
			log.Printf("Created contact: %s %s", contacts[i].FirstName, contacts[i].LastName)
		}
	}

	// Create comprehensive contact information for each contact
	for _, contact := range contacts {
		// Phone numbers (1-3 per contact)
		phoneNumbers := []models.PhoneNumber{
			{
				Number:     generatePhoneNumber(),
				Extension:  nil,
				IsPrimary:  true,
				TypeID:     &phoneTypes[0].ID, // Mobile
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			},
		}

		// Add work phone for 60% of contacts
		if rand.Float32() < 0.6 {
			extension := fmt.Sprintf("%d", rand.Intn(9999)+1000)
			phoneNumbers = append(phoneNumbers, models.PhoneNumber{
				Number:     generatePhoneNumber(),
				Extension:  &extension,
				IsPrimary:  false,
				TypeID:     &phoneTypes[1].ID, // Work
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Add home phone for 30% of contacts
		if rand.Float32() < 0.3 {
			phoneNumbers = append(phoneNumbers, models.PhoneNumber{
				Number:     generatePhoneNumber(),
				Extension:  nil,
				IsPrimary:  false,
				TypeID:     &phoneTypes[2].ID, // Home
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Email addresses (1-2 per contact)
		emailAddresses := []models.EmailAddress{
			{
				Email:      generateEmail(contact.FirstName, contact.LastName),
				IsPrimary:  true,
				IsVerified: rand.Float32() > 0.2, // 80% verified
				TypeID:     &emailTypes[0].ID,    // Personal
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			},
		}

		// Add work email for 70% of contacts
		if rand.Float32() < 0.7 {
			emailAddresses = append(emailAddresses, models.EmailAddress{
				Email:      generateWorkEmail(contact.FirstName, contact.LastName, contact.CompanyID),
				IsPrimary:  false,
				IsVerified: rand.Float32() > 0.1, // 90% verified
				TypeID:     &emailTypes[1].ID,    // Work
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Addresses (1-2 per contact)
		addresses := []models.Address{
			{
				Street1:    stringPtr(generateStreetAddress()),
				Street2:    nil,
				City:       stringPtr(generateCity()),
				State:      stringPtr(generateState()),
				PostalCode: stringPtr(generatePostalCode()),
				Country:    stringPtr("United States"),
				IsPrimary:  true,
				TypeID:     &addressTypes[0].ID, // Home
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			},
		}

		// Add work address for 40% of contacts
		if rand.Float32() < 0.4 {
			street2 := fmt.Sprintf("Suite %d", rand.Intn(999)+100)
			addresses = append(addresses, models.Address{
				Street1:    stringPtr(generateStreetAddress()),
				Street2:    &street2,
				City:       stringPtr(generateCity()),
				State:      stringPtr(generateState()),
				PostalCode: stringPtr(generatePostalCode()),
				Country:    stringPtr("United States"),
				IsPrimary:  false,
				TypeID:     &addressTypes[1].ID, // Work
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Social media accounts (1-3 per contact)
		socialMediaAccounts := []models.SocialMediaAccount{
			{
				Username:   stringPtr(generateUsername(contact.FirstName, contact.LastName)),
				URL:        stringPtr(generateLinkedInURL(contact.FirstName, contact.LastName)),
				IsPrimary:  true,
				TypeID:     &socialMediaTypes[0].ID, // LinkedIn
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			},
		}

		// Add Twitter for 50% of contacts
		if rand.Float32() < 0.5 {
			socialMediaAccounts = append(socialMediaAccounts, models.SocialMediaAccount{
				Username:   stringPtr(generateUsername(contact.FirstName, contact.LastName)),
				URL:        stringPtr(generateTwitterURL(contact.FirstName, contact.LastName)),
				IsPrimary:  false,
				TypeID:     &socialMediaTypes[1].ID, // Twitter
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Add Facebook for 40% of contacts
		if rand.Float32() < 0.4 {
			socialMediaAccounts = append(socialMediaAccounts, models.SocialMediaAccount{
				Username:   stringPtr(generateUsername(contact.FirstName, contact.LastName)),
				URL:        stringPtr(generateFacebookURL(contact.FirstName, contact.LastName)),
				IsPrimary:  false,
				TypeID:     &socialMediaTypes[2].ID, // Facebook
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Add Instagram for 30% of contacts
		if rand.Float32() < 0.3 {
			socialMediaAccounts = append(socialMediaAccounts, models.SocialMediaAccount{
				Username:   stringPtr(generateUsername(contact.FirstName, contact.LastName)),
				URL:        stringPtr(generateInstagramURL(contact.FirstName, contact.LastName)),
				IsPrimary:  false,
				TypeID:     &socialMediaTypes[3].ID, // Instagram
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			})
		}

		// Create all contact information
		for _, phone := range phoneNumbers {
			if err := config.DB.Create(&phone).Error; err != nil {
				log.Printf("Warning: Failed to create phone number for %s %s: %v", contact.FirstName, contact.LastName, err)
			}
		}

		for _, email := range emailAddresses {
			if err := config.DB.Create(&email).Error; err != nil {
				log.Printf("Warning: Failed to create email for %s %s: %v", contact.FirstName, contact.LastName, err)
			}
		}

		for _, address := range addresses {
			if err := config.DB.Create(&address).Error; err != nil {
				log.Printf("Warning: Failed to create address for %s %s: %v", contact.FirstName, contact.LastName, err)
			}
		}

		for _, social := range socialMediaAccounts {
			if err := config.DB.Create(&social).Error; err != nil {
				log.Printf("Warning: Failed to create social media for %s %s: %v", contact.FirstName, contact.LastName, err)
			}
		}

		log.Printf("Created comprehensive contact info for %s %s (%d phones, %d emails, %d addresses, %d social)",
			contact.FirstName, contact.LastName, len(phoneNumbers), len(emailAddresses), len(addresses), len(socialMediaAccounts))
	}

	log.Println("")
	log.Println("=== CONTACT SEEDING COMPLETED ===")
	log.Printf("• Created %d companies", len(companies))
	log.Printf("• Created %d contacts with comprehensive data", len(contacts))
	log.Println("• Each contact includes:")
	log.Println("  - 1-3 phone numbers (Mobile, Work, Home)")
	log.Println("  - 1-2 email addresses (Personal, Work)")
	log.Println("  - 1-2 addresses (Home, Work)")
	log.Println("  - 1-4 social media accounts (LinkedIn, Twitter, Facebook, Instagram)")
	log.Println("• All data is realistic and diverse")
	log.Println("")
	log.Println("You can now test the contacts functionality with rich sample data!")
}
