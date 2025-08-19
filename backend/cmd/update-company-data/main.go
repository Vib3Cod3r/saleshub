package main

import (
	"log"
	"saleshub-backend/config"
	"saleshub-backend/models"

	"gorm.io/gorm"
)

// Geographic data with proper city-country mappings
var cityCountryMappings = []struct {
	city    string
	country string
}{
	// United States cities
	{"New York", "United States"}, {"Los Angeles", "United States"}, {"Chicago", "United States"},
	{"Houston", "United States"}, {"Phoenix", "United States"}, {"Philadelphia", "United States"},
	{"San Antonio", "United States"}, {"San Diego", "United States"}, {"Dallas", "United States"},
	{"San Jose", "United States"}, {"Austin", "United States"}, {"Jacksonville", "United States"},
	{"Fort Worth", "United States"}, {"Columbus", "United States"}, {"Charlotte", "United States"},
	{"San Francisco", "United States"}, {"Indianapolis", "United States"}, {"Seattle", "United States"},
	{"Denver", "United States"}, {"Washington", "United States"}, {"Boston", "United States"},
	{"El Paso", "United States"}, {"Nashville", "United States"}, {"Detroit", "United States"},
	{"Oklahoma City", "United States"}, {"Portland", "United States"}, {"Las Vegas", "United States"},
	{"Memphis", "United States"}, {"Louisville", "United States"}, {"Baltimore", "United States"},
	{"Milwaukee", "United States"}, {"Albuquerque", "United States"}, {"Tucson", "United States"},
	{"Fresno", "United States"}, {"Sacramento", "United States"}, {"Atlanta", "United States"},
	{"Kansas City", "United States"}, {"Long Beach", "United States"}, {"Colorado Springs", "United States"},
	{"Miami", "United States"}, {"Raleigh", "United States"}, {"Omaha", "United States"},
	{"Minneapolis", "United States"}, {"Cleveland", "United States"}, {"Tulsa", "United States"},
	{"Oakland", "United States"}, {"Wichita", "United States"}, {"New Orleans", "United States"},
	{"Arlington", "United States"}, {"Tampa", "United States"}, {"Bakersfield", "United States"},
	{"Aurora", "United States"}, {"Anaheim", "United States"}, {"Santa Ana", "United States"},
	{"Corpus Christi", "United States"}, {"Riverside", "United States"}, {"Lexington", "United States"},
	{"Stockton", "United States"}, {"Henderson", "United States"}, {"Saint Paul", "United States"},
	{"St. Louis", "United States"}, {"Fort Wayne", "United States"}, {"Jersey City", "United States"},
	{"Chandler", "United States"}, {"Madison", "United States"}, {"Lubbock", "United States"},
	{"Scottsdale", "United States"}, {"Reno", "United States"}, {"Buffalo", "United States"},
	{"Gilbert", "United States"}, {"Glendale", "United States"},

	// International cities
	{"Toronto", "Canada"}, {"Vancouver", "Canada"}, {"Montreal", "Canada"},
	{"London", "United Kingdom"}, {"Manchester", "United Kingdom"}, {"Birmingham", "United Kingdom"},
	{"Berlin", "Germany"}, {"Munich", "Germany"}, {"Hamburg", "Germany"},
	{"Paris", "France"}, {"Lyon", "France"}, {"Marseille", "France"},
	{"Tokyo", "Japan"}, {"Osaka", "Japan"}, {"Yokohama", "Japan"},
	{"Sydney", "Australia"}, {"Melbourne", "Australia"}, {"Brisbane", "Australia"},
	{"Rome", "Italy"}, {"Milan", "Italy"}, {"Naples", "Italy"},
	{"Madrid", "Spain"}, {"Barcelona", "Spain"}, {"Valencia", "Spain"},
	{"Amsterdam", "Netherlands"}, {"Rotterdam", "Netherlands"}, {"The Hague", "Netherlands"},
	{"Zurich", "Switzerland"}, {"Geneva", "Switzerland"}, {"Basel", "Switzerland"},
	{"Stockholm", "Sweden"}, {"Gothenburg", "Sweden"}, {"Malmö", "Sweden"},
	{"Oslo", "Norway"}, {"Bergen", "Norway"}, {"Trondheim", "Norway"},
	{"Copenhagen", "Denmark"}, {"Aarhus", "Denmark"}, {"Odense", "Denmark"},
	{"Helsinki", "Finland"}, {"Tampere", "Finland"}, {"Turku", "Finland"},
	{"Brussels", "Belgium"}, {"Antwerp", "Belgium"}, {"Ghent", "Belgium"},
	{"Dublin", "Ireland"}, {"Cork", "Ireland"}, {"Galway", "Ireland"},
	{"Singapore", "Singapore"}, {"Wellington", "New Zealand"}, {"Auckland", "New Zealand"},
	{"Seoul", "South Korea"}, {"Busan", "South Korea"}, {"Incheon", "South Korea"},
	{"São Paulo", "Brazil"}, {"Rio de Janeiro", "Brazil"}, {"Brasília", "Brazil"},
	{"Mexico City", "Mexico"}, {"Guadalajara", "Mexico"}, {"Monterrey", "Mexico"},
	{"Mumbai", "India"}, {"Delhi", "India"}, {"Bangalore", "India"},
	{"Beijing", "China"}, {"Shanghai", "China"}, {"Guangzhou", "China"},
	{"Moscow", "Russia"}, {"Saint Petersburg", "Russia"}, {"Novosibirsk", "Russia"},
	{"Cape Town", "South Africa"}, {"Johannesburg", "South Africa"}, {"Durban", "South Africa"},
	{"Buenos Aires", "Argentina"}, {"Córdoba", "Argentina"}, {"Rosario", "Argentina"},
	{"Santiago", "Chile"}, {"Valparaíso", "Chile"}, {"Concepción", "Chile"},
	{"Bogotá", "Colombia"}, {"Medellín", "Colombia"}, {"Cali", "Colombia"},
	{"Lima", "Peru"}, {"Arequipa", "Peru"}, {"Trujillo", "Peru"},
	{"Caracas", "Venezuela"}, {"Maracaibo", "Venezuela"}, {"Valencia", "Venezuela"},
	{"Quito", "Ecuador"}, {"Guayaquil", "Ecuador"}, {"Cuenca", "Ecuador"},
	{"Montevideo", "Uruguay"}, {"Salto", "Uruguay"}, {"Paysandú", "Uruguay"},
	{"Asunción", "Paraguay"}, {"Ciudad del Este", "Paraguay"}, {"San Lorenzo", "Paraguay"},
	{"La Paz", "Bolivia"}, {"Santa Cruz", "Bolivia"}, {"Cochabamba", "Bolivia"},
	{"Georgetown", "Guyana"}, {"Paramaribo", "Suriname"}, {"Cayenne", "French Guiana"},
	{"Stanley", "Falkland Islands"}, {"Nuuk", "Greenland"}, {"Reykjavík", "Iceland"},
	{"Lisbon", "Portugal"}, {"Porto", "Portugal"}, {"Coimbra", "Portugal"},
	{"Warsaw", "Poland"}, {"Kraków", "Poland"}, {"Łódź", "Poland"},
	{"Prague", "Czech Republic"}, {"Brno", "Czech Republic"}, {"Ostrava", "Czech Republic"},
	{"Budapest", "Hungary"}, {"Debrecen", "Hungary"}, {"Szeged", "Hungary"},
	{"Bratislava", "Slovakia"}, {"Košice", "Slovakia"}, {"Žilina", "Slovakia"},
	{"Ljubljana", "Slovenia"}, {"Maribor", "Slovenia"}, {"Celje", "Slovenia"},
	{"Zagreb", "Croatia"}, {"Split", "Croatia"}, {"Rijeka", "Croatia"},
	{"Belgrade", "Serbia"}, {"Novi Sad", "Serbia"}, {"Niš", "Serbia"},
	{"Sarajevo", "Bosnia and Herzegovina"}, {"Banja Luka", "Bosnia and Herzegovina"}, {"Tuzla", "Bosnia and Herzegovina"},
	{"Podgorica", "Montenegro"}, {"Nikšić", "Montenegro"}, {"Bar", "Montenegro"},
	{"Tirana", "Albania"}, {"Durrës", "Albania"}, {"Vlorë", "Albania"},
	{"Skopje", "Macedonia"}, {"Bitola", "Macedonia"}, {"Kumanovo", "Macedonia"},
	{"Sofia", "Bulgaria"}, {"Plovdiv", "Bulgaria"}, {"Varna", "Bulgaria"},
	{"Bucharest", "Romania"}, {"Cluj-Napoca", "Romania"}, {"Timișoara", "Romania"},
	{"Chișinău", "Moldova"}, {"Tiraspol", "Moldova"}, {"Bălți", "Moldova"},
	{"Kyiv", "Ukraine"}, {"Kharkiv", "Ukraine"}, {"Odesa", "Ukraine"},
	{"Minsk", "Belarus"}, {"Gomel", "Belarus"}, {"Mogilev", "Belarus"},
	{"Vilnius", "Lithuania"}, {"Kaunas", "Lithuania"}, {"Klaipėda", "Lithuania"},
	{"Riga", "Latvia"}, {"Daugavpils", "Latvia"}, {"Liepāja", "Latvia"},
	{"Tallinn", "Estonia"}, {"Tartu", "Estonia"}, {"Narva", "Estonia"},
	{"Almaty", "Kazakhstan"}, {"Nur-Sultan", "Kazakhstan"}, {"Shymkent", "Kazakhstan"},
	{"Tashkent", "Uzbekistan"}, {"Samarkand", "Uzbekistan"}, {"Namangan", "Uzbekistan"},
	{"Ashgabat", "Turkmenistan"}, {"Türkmenabat", "Turkmenistan"}, {"Daşoguz", "Turkmenistan"},
	{"Dushanbe", "Tajikistan"}, {"Khujand", "Tajikistan"}, {"Kulob", "Tajikistan"},
	{"Kabul", "Afghanistan"}, {"Kandahar", "Afghanistan"}, {"Herat", "Afghanistan"},
	{"Islamabad", "Pakistan"}, {"Karachi", "Pakistan"}, {"Lahore", "Pakistan"},
	{"Dhaka", "Bangladesh"}, {"Chittagong", "Bangladesh"}, {"Khulna", "Bangladesh"},
}

func main() {
	// Initialize database connection
	config.InitDatabase()

	log.Printf("Starting to fix geographic data for companies...")

	// Get all companies
	var companies []models.Company
	if err := config.DB.Where("deleted_at IS NULL").Find(&companies).Error; err != nil {
		log.Fatalf("Failed to fetch companies: %v", err)
	}

	log.Printf("Found %d companies to update", len(companies))

	// Update each company with proper geographic data
	for i, company := range companies {
		updateCompanyGeographicData(&company, i, config.DB)
	}

	log.Printf("Geographic data fix completed!")
}

func updateCompanyGeographicData(company *models.Company, index int, db *gorm.DB) {
	// Get a random city-country mapping
	mapping := cityCountryMappings[index%len(cityCountryMappings)]
	
	// Update the company's address
	var address models.Address
	err := db.Where("entity_id = ? AND entity_type = ?", company.ID, "Company").First(&address).Error
	
	if err != nil {
		// Create new address if it doesn't exist
		address = models.Address{
			EntityID:   company.ID,
			EntityType: "Company",
			TenantID:   company.TenantID,
			City:       &mapping.city,
			Country:    &mapping.country,
			IsPrimary:  true,
		}
		
		if err := db.Create(&address).Error; err != nil {
			log.Printf("Failed to create address for company %s: %v", company.Name, err)
			return
		}
	} else {
		// Update existing address
		address.City = &mapping.city
		address.Country = &mapping.country
		
		if err := db.Save(&address).Error; err != nil {
			log.Printf("Failed to update address for company %s: %v", company.Name, err)
			return
		}
	}

	log.Printf("Updated company: %s (City: %s, Country: %s)", company.Name, mapping.city, mapping.country)
}
