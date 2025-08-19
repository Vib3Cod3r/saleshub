package main

import (
	"log"
	"math/rand"
	"saleshub-backend/config"
	"saleshub-backend/models"
	"time"

	"github.com/google/uuid"
)

// Sample data arrays
var companyOwners = []string{
	"Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Thompson", "Lisa Wang",
	"James Wilson", "Jennifer Davis", "Robert Brown", "Amanda Garcia", "Christopher Lee",
	"Jessica Martinez", "Kevin Taylor", "Nicole Anderson", "Andrew Jackson", "Rachel White",
	"Alex Turner", "Maria Gonzalez", "Daniel Kim", "Sophie Chen", "Ryan Mitchell",
	"Ashley Williams", "Brandon Davis", "Megan Thompson", "Jordan Lee", "Taylor Smith",
	"Casey Johnson", "Morgan Brown", "Riley Wilson", "Quinn Davis", "Parker Miller",
	"Blake Wilson", "Avery Johnson", "Cameron Smith", "Dakota Brown", "Emerson Davis",
	"Finley Wilson", "Gray Johnson", "Harper Smith", "Indigo Brown", "Jasper Davis",
	"Kai Wilson", "Luna Johnson", "Mason Smith", "Nova Brown", "Ocean Davis",
	"Phoenix Wilson", "River Johnson", "Sage Smith", "Storm Brown", "Tiger Davis",
	"Violet Wilson", "Willow Johnson", "Xander Smith", "Yara Brown", "Zara Davis",
	"Atlas Wilson", "Bella Johnson", "Cedar Smith", "Dawn Brown", "Echo Davis",
	"Flora Wilson", "Grove Johnson", "Haven Smith", "Iris Brown", "Jade Davis",
	"Kale Wilson", "Lily Johnson", "Maple Smith", "Nova Brown", "Oak Davis",
	"Pine Wilson", "Quill Johnson", "Rose Smith", "Sage Brown", "Thorn Davis",
	"Vine Wilson", "Wren Johnson", "Yarrow Smith", "Zinnia Brown", "Aster Davis",
}

var cities = []string{
	"New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
	"Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
	"Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
	"San Francisco", "Indianapolis", "Seattle", "Denver", "Washington",
	"Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City",
	"Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
	"Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento",
	"Atlanta", "Kansas City", "Long Beach", "Colorado Springs", "Miami",
	"Raleigh", "Omaha", "Minneapolis", "Cleveland", "Tulsa",
	"Oakland", "Wichita", "New Orleans", "Arlington", "Tampa",
	"Bakersfield", "Aurora", "Anaheim", "Santa Ana", "Corpus Christi",
	"Riverside", "Lexington", "Stockton", "Henderson", "Saint Paul",
	"St. Louis", "Fort Wayne", "Jersey City", "Chandler", "Madison",
	"Lubbock", "Scottsdale", "Reno", "Buffalo", "Gilbert",
	"Glendale", "North Las Vegas", "Winston-Salem", "Chesapeake", "Norfolk",
	"Fremont", "Garland", "Irving", "Hialeah", "Richmond",
}

var countries = []string{
	"United States", "Canada", "United Kingdom", "Germany", "France",
	"Japan", "Australia", "Italy", "Spain", "Netherlands",
	"Switzerland", "Sweden", "Norway", "Denmark", "Finland",
	"Belgium", "Austria", "Ireland", "New Zealand", "Singapore",
	"South Korea", "Brazil", "Mexico", "India", "China",
	"Russia", "South Africa", "Argentina", "Chile", "Colombia",
	"Peru", "Venezuela", "Ecuador", "Uruguay", "Paraguay",
	"Bolivia", "Guyana", "Suriname", "French Guiana", "Falkland Islands",
	"Greenland", "Iceland", "Portugal", "Greece", "Poland",
	"Czech Republic", "Hungary", "Slovakia", "Slovenia", "Croatia",
	"Serbia", "Bosnia and Herzegovina", "Montenegro", "Albania", "Macedonia",
	"Bulgaria", "Romania", "Moldova", "Ukraine", "Belarus",
	"Lithuania", "Latvia", "Estonia", "Kazakhstan", "Uzbekistan",
	"Turkmenistan", "Kyrgyzstan", "Tajikistan", "Afghanistan", "Pakistan",
	"Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Myanmar",
	"Thailand", "Laos", "Cambodia", "Vietnam", "Malaysia",
	"Indonesia", "Philippines", "Taiwan", "Hong Kong", "Macau",
}

func main() {
	// Initialize database connection
	config.InitDatabase()

	log.Println("Connected to database successfully")

	// Get all companies
	var companies []models.Company
	if err := config.DB.Where("deleted_at IS NULL").Find(&companies).Error; err != nil {
		log.Fatal("Failed to query companies:", err)
	}

	log.Printf("Found %d companies to update", len(companies))

	// Update each company
	for i, company := range companies {
		updateCompany(&company, i)
	}

	log.Println("Company data update completed!")
}

func updateCompany(company *models.Company, index int) {
	// Set random seed based on company ID
	rand.Seed(time.Now().UnixNano() + int64(index))

	// Get random data
	ownerName := companyOwners[index%len(companyOwners)]
	city := cities[index%len(cities)]
	country := countries[index%len(countries)]

	// Generate realistic dates
	createDate := time.Now().AddDate(0, -rand.Intn(24), -rand.Intn(30))
	lastActivity := time.Now().AddDate(0, 0, -rand.Intn(30))

	// Update company dates
	company.CreatedAt = createDate
	company.UpdatedAt = lastActivity

	if err := config.DB.Save(company).Error; err != nil {
		log.Printf("Failed to update company %s dates: %v", company.Name, err)
		return
	}

	// Check if address exists
	var existingAddress models.Address
	err := config.DB.Where("entity_id = ? AND entity_type = ?", company.ID, "Company").First(&existingAddress).Error
	
	if err != nil {
		// Create new address
		address := models.Address{
			ID:         uuid.New().String(),
			City:       &city,
			Country:    &country,
			IsPrimary:  true,
			EntityID:   company.ID,
			EntityType: "Company",
			TenantID:   company.TenantID,
			CreatedAt:  createDate,
			UpdatedAt:  lastActivity,
		}
		
		if err := config.DB.Create(&address).Error; err != nil {
			log.Printf("Failed to create address for company %s: %v", company.Name, err)
			return
		}
	} else {
		// Update existing address
		existingAddress.City = &city
		existingAddress.Country = &country
		existingAddress.UpdatedAt = lastActivity
		
		if err := config.DB.Save(&existingAddress).Error; err != nil {
			log.Printf("Failed to update address for company %s: %v", company.Name, err)
			return
		}
	}

	log.Printf("Updated company: %s (Owner: %s, City: %s, Country: %s)", company.Name, ownerName, city, country)
}
