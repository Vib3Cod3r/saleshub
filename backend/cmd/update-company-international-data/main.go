package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

// Company data structure
type CompanyUpdate struct {
	ID          string
	Name        string
	PhoneNumber string
	Email       string
	City        string
	State       string
	Country     string
	Website     string
}

// UK cities and phone codes
var ukCities = []struct {
	City      string
	PhoneCode string
}{
	{"London", "+44 20"},
	{"Manchester", "+44 161"},
	{"Birmingham", "+44 121"},
	{"Leeds", "+44 113"},
	{"Liverpool", "+44 151"},
	{"Sheffield", "+44 114"},
	{"Edinburgh", "+44 131"},
	{"Bristol", "+44 117"},
	{"Glasgow", "+44 141"},
	{"Cardiff", "+44 29"},
	{"Newcastle", "+44 191"},
	{"Belfast", "+44 28"},
	{"Nottingham", "+44 115"},
	{"Southampton", "+44 23"},
	{"Oxford", "+44 1865"},
}

// Hong Kong cities and phone codes
var hkCities = []struct {
	City      string
	PhoneCode string
}{
	{"Hong Kong", "+852"},
	{"Kowloon", "+852"},
	{"Tsuen Wan", "+852"},
	{"Sha Tin", "+852"},
	{"Tuen Mun", "+852"},
	{"Yuen Long", "+852"},
	{"Tai Po", "+852"},
	{"Fanling", "+852"},
	{"Sheung Shui", "+852"},
	{"Tseung Kwan O", "+852"},
	{"Kwun Tong", "+852"},
	{"Wong Tai Sin", "+852"},
	{"Sham Shui Po", "+852"},
	{"Yau Tsim Mong", "+852"},
	{"Central and Western", "+852"},
}

// Singapore cities and phone codes
var sgCities = []struct {
	City      string
	PhoneCode string
}{
	{"Singapore", "+65"},
	{"Jurong West", "+65"},
	{"Woodlands", "+65"},
	{"Tampines", "+65"},
	{"Sengkang", "+65"},
	{"Hougang", "+65"},
	{"Yishun", "+65"},
	{"Ang Mo Kio", "+65"},
	{"Bedok", "+65"},
	{"Pasir Ris", "+65"},
	{"Bukit Batok", "+65"},
	{"Bukit Panjang", "+65"},
	{"Choa Chu Kang", "+65"},
	{"Clementi", "+65"},
	{"Geylang", "+65"},
}

// US cities and phone codes
var usCities = []struct {
	City      string
	State     string
	PhoneCode string
}{
	{"New York", "NY", "+1 212"},
	{"Los Angeles", "CA", "+1 213"},
	{"Chicago", "IL", "+1 312"},
	{"Houston", "TX", "+1 713"},
	{"Phoenix", "AZ", "+1 602"},
	{"Philadelphia", "PA", "+1 215"},
	{"San Antonio", "TX", "+1 210"},
	{"San Diego", "CA", "+1 619"},
	{"Dallas", "TX", "+1 214"},
	{"San Jose", "CA", "+1 408"},
	{"Austin", "TX", "+1 512"},
	{"Jacksonville", "FL", "+1 904"},
	{"Fort Worth", "TX", "+1 817"},
	{"Columbus", "OH", "+1 614"},
	{"Charlotte", "NC", "+1 704"},
	{"San Francisco", "CA", "+1 415"},
	{"Indianapolis", "IN", "+1 317"},
	{"Seattle", "WA", "+1 206"},
	{"Denver", "CO", "+1 303"},
	{"Washington", "DC", "+1 202"},
}

// Company name suffixes by country
var companySuffixes = map[string][]string{
	"UK": {"Ltd", "PLC", "Limited", "Group", "Holdings", "Partners", "Associates", "Enterprises", "Solutions", "Services"},
	"HK": {"Limited", "Group", "Holdings", "Enterprises", "Trading", "International", "Corporation", "Company", "Partners", "Solutions"},
	"SG": {"Pte Ltd", "Limited", "Group", "Holdings", "Corporation", "International", "Enterprises", "Solutions", "Services", "Partners"},
	"US": {"Inc", "Corp", "LLC", "Group", "Holdings", "Partners", "Associates", "Enterprises", "Solutions", "Services"},
}

// Industry sectors
var industries = []string{
	"Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Real Estate", "Consulting", "Education", "Transportation", "Energy",
	"Media", "Telecommunications", "Food & Beverage", "Automotive", "Aerospace", "Pharmaceuticals", "Construction", "Hospitality", "Legal", "Marketing",
}

// Company name prefixes
var companyPrefixes = []string{
	"Global", "Advanced", "Premier", "Elite", "Innovative", "Strategic", "Dynamic", "Progressive", "Excellence", "Quality",
	"Professional", "Expert", "Specialized", "Integrated", "Comprehensive", "Complete", "Total", "Full", "Comprehensive", "Alliance",
	"Partnership", "Collaboration", "Synergy", "Unified", "Consolidated", "Merged", "Combined", "Joint", "Shared", "Collective",
}

// Company name cores
var companyCores = []string{
	"Solutions", "Systems", "Technologies", "Services", "Consulting", "Management", "Advisory", "Partners", "Associates", "Group",
	"Enterprises", "Corporation", "Industries", "Manufacturing", "Trading", "Investment", "Capital", "Finance", "Insurance", "Real Estate",
	"Healthcare", "Medical", "Pharmaceutical", "Biotech", "Software", "Hardware", "Network", "Digital", "Online", "E-commerce",
}

func main() {
	// Database connection
	db, err := sql.Open("postgres", "postgres://postgres:Miyako2020@localhost:5432/sales_crm?sslmode=disable")
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer db.Close()

	// Test connection
	err = db.Ping()
	if err != nil {
		log.Fatal("Error pinging database:", err)
	}

	fmt.Println("Connected to database successfully")

	// Get all companies
	rows, err := db.Query("SELECT id, name FROM companies ORDER BY name")
	if err != nil {
		log.Fatal("Error querying companies:", err)
	}
	defer rows.Close()

	var companies []string
	var companyIDs []string
	for rows.Next() {
		var id, name string
		err := rows.Scan(&id, &name)
		if err != nil {
			log.Printf("Error scanning company: %v", err)
			continue
		}
		companies = append(companies, name)
		companyIDs = append(companyIDs, id)
	}

	fmt.Printf("Found %d companies to update\n", len(companies))

	// Seed random number generator
	rand.Seed(time.Now().UnixNano())

	// Update companies in batches for each country
	countries := []string{"UK", "HK", "SG", "US"}
	companiesPerCountry := len(companyIDs) / len(countries)
	remaining := len(companyIDs) % len(countries)

	startIdx := 0
	for i, country := range countries {
		endIdx := startIdx + companiesPerCountry
		if i < remaining {
			endIdx++ // Distribute remaining companies
		}
		if endIdx > len(companyIDs) {
			endIdx = len(companyIDs)
		}

		fmt.Printf("Updating companies %d-%d for %s (%d companies)\n", startIdx+1, endIdx, country, endIdx-startIdx)
		updateCompaniesForCountry(db, companyIDs[startIdx:endIdx], country)
		startIdx = endIdx
	}

	fmt.Println("Company updates completed successfully!")
}

func updateCompaniesForCountry(db *sql.DB, companyIDs []string, country string) {
	var cities []struct {
		City      string
		State     string
		PhoneCode string
	}

	switch country {
	case "UK":
		for _, c := range ukCities {
			cities = append(cities, struct {
				City      string
				State     string
				PhoneCode string
			}{c.City, "", c.PhoneCode})
		}
	case "HK":
		for _, c := range hkCities {
			cities = append(cities, struct {
				City      string
				State     string
				PhoneCode string
			}{c.City, "", c.PhoneCode})
		}
	case "SG":
		for _, c := range sgCities {
			cities = append(cities, struct {
				City      string
				State     string
				PhoneCode string
			}{c.City, "", c.PhoneCode})
		}
	case "US":
		for _, c := range usCities {
			cities = append(cities, struct {
				City      string
				State     string
				PhoneCode string
			}{c.City, c.State, c.PhoneCode})
		}
	}

	for _, companyID := range companyIDs {
		// Generate new company data
		companyData := generateCompanyData(country, cities)

		// Update company name
		_, err := db.Exec("UPDATE companies SET name = $1 WHERE id = $2", companyData.Name, companyID)
		if err != nil {
			log.Printf("Error updating company name for %s: %v", companyID, err)
			continue
		}

		// Update or create address
		updateAddress(db, companyID, companyData)

		// Update or create phone number
		updatePhoneNumber(db, companyID, companyData)

		// Update or create email address
		updateEmailAddress(db, companyID, companyData)

		fmt.Printf("Updated company: %s\n", companyData.Name)
	}
}

func generateCompanyData(country string, cities []struct {
	City      string
	State     string
	PhoneCode string
}) CompanyUpdate {
	// Select random city
	cityData := cities[rand.Intn(len(cities))]

	// Generate company name
	prefix := companyPrefixes[rand.Intn(len(companyPrefixes))]
	core := companyCores[rand.Intn(len(companyCores))]
	suffixes := companySuffixes[country]
	suffix := suffixes[rand.Intn(len(suffixes))]

	name := fmt.Sprintf("%s %s %s", prefix, core, suffix)

	// Generate phone number
	phoneNumber := generatePhoneNumber(cityData.PhoneCode, country)

	// Generate email
	email := generateEmail(name, country)

	// Generate website
	website := generateWebsite(name, country)

	return CompanyUpdate{
		Name:        name,
		PhoneNumber: phoneNumber,
		Email:       email,
		City:        cityData.City,
		State:       cityData.State,
		Country:     getFullCountryName(country),
		Website:     website,
	}
}

func generatePhoneNumber(phoneCode, country string) string {
	var number string
	switch country {
	case "UK":
		// UK format: +44 20 7946 0958
		number = fmt.Sprintf("%s %d%d%d%d %d%d%d%d", phoneCode, rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10))
	case "HK":
		// Hong Kong format: +852 2345 6789
		number = fmt.Sprintf("%s %d%d%d%d %d%d%d%d", phoneCode, rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10))
	case "SG":
		// Singapore format: +65 6123 4567
		number = fmt.Sprintf("%s %d%d%d%d %d%d%d%d", phoneCode, rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10))
	case "US":
		// US format: +1 212 555 0123
		number = fmt.Sprintf("%s %d%d%d %d%d%d%d", phoneCode, rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10), rand.Intn(10))
	}
	return number
}

func generateEmail(companyName, country string) string {
	// Clean company name for email
	cleanName := strings.ReplaceAll(companyName, " ", "")
	cleanName = strings.ReplaceAll(cleanName, "&", "and")
	cleanName = strings.ReplaceAll(cleanName, ".", "")
	cleanName = strings.ToLower(cleanName)

	var domain string
	switch country {
	case "UK":
		domain = "co.uk"
	case "HK":
		domain = "com.hk"
	case "SG":
		domain = "com.sg"
	case "US":
		domain = "com"
	}

	return fmt.Sprintf("info@%s.%s", cleanName, domain)
}

func generateWebsite(companyName, country string) string {
	// Clean company name for website
	cleanName := strings.ReplaceAll(companyName, " ", "")
	cleanName = strings.ReplaceAll(cleanName, "&", "and")
	cleanName = strings.ReplaceAll(cleanName, ".", "")
	cleanName = strings.ToLower(cleanName)

	var domain string
	switch country {
	case "UK":
		domain = "co.uk"
	case "HK":
		domain = "com.hk"
	case "SG":
		domain = "com.sg"
	case "US":
		domain = "com"
	}

	return fmt.Sprintf("https://www.%s.%s", cleanName, domain)
}

func getFullCountryName(countryCode string) string {
	switch countryCode {
	case "UK":
		return "United Kingdom"
	case "HK":
		return "Hong Kong"
	case "SG":
		return "Singapore"
	case "US":
		return "United States"
	default:
		return countryCode
	}
}

func updateAddress(db *sql.DB, companyID string, data CompanyUpdate) {
	// Check if address exists
	var existingID string
	err := db.QueryRow("SELECT id FROM addresses WHERE entity_id = $1 AND entity_type = 'Company' LIMIT 1", companyID).Scan(&existingID)

	if err == sql.ErrNoRows {
		// Create new address
		_, err = db.Exec(`
			INSERT INTO addresses (entity_id, entity_type, street1, city, state, country, is_primary, tenant_id)
			SELECT $1, 'Company', $2, $3, $4, $5, true, tenant_id FROM companies WHERE id = $1
		`, companyID, fmt.Sprintf("%d %s Street", rand.Intn(9999)+1, data.City), data.City, data.State, data.Country)
	} else if err == nil {
		// Update existing address
		_, err = db.Exec(`
			UPDATE addresses 
			SET street1 = $1, city = $2, state = $3, country = $4
			WHERE entity_id = $5 AND entity_type = 'Company'
		`, fmt.Sprintf("%d %s Street", rand.Intn(9999)+1, data.City), data.City, data.State, data.Country, companyID)
	}

	if err != nil {
		log.Printf("Error updating address for company %s: %v", companyID, err)
	}
}

func updatePhoneNumber(db *sql.DB, companyID string, data CompanyUpdate) {
	// Check if phone number exists
	var existingID string
	err := db.QueryRow("SELECT id FROM phone_numbers WHERE entity_id = $1 AND entity_type = 'Company' LIMIT 1", companyID).Scan(&existingID)

	if err == sql.ErrNoRows {
		// Create new phone number
		_, err = db.Exec(`
			INSERT INTO phone_numbers (entity_id, entity_type, number, is_primary, tenant_id)
			SELECT $1, 'Company', $2, true, tenant_id FROM companies WHERE id = $1
		`, companyID, data.PhoneNumber)
	} else if err == nil {
		// Update existing phone number
		_, err = db.Exec(`
			UPDATE phone_numbers 
			SET number = $1
			WHERE entity_id = $2 AND entity_type = 'Company'
		`, data.PhoneNumber, companyID)
	}

	if err != nil {
		log.Printf("Error updating phone number for company %s: %v", companyID, err)
	}
}

func updateEmailAddress(db *sql.DB, companyID string, data CompanyUpdate) {
	// Check if email exists
	var existingID string
	err := db.QueryRow("SELECT id FROM email_addresses WHERE entity_id = $1 AND entity_type = 'Company' LIMIT 1", companyID).Scan(&existingID)

	if err == sql.ErrNoRows {
		// Create new email address
		_, err = db.Exec(`
			INSERT INTO email_addresses (entity_id, entity_type, email, is_primary, tenant_id)
			SELECT $1, 'Company', $2, true, tenant_id FROM companies WHERE id = $1
		`, companyID, data.Email)
	} else if err == nil {
		// Update existing email address
		_, err = db.Exec(`
			UPDATE email_addresses 
			SET email = $1
			WHERE entity_id = $2 AND entity_type = 'Company'
		`, data.Email, companyID)
	}

	if err != nil {
		log.Printf("Error updating email address for company %s: %v", companyID, err)
	}
}
