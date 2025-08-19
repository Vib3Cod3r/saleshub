-- Fix Contact Addresses - Simplified Standardization Script
-- This script will clean up and standardize address data in the contacts table

-- Step 1: Update US addresses with proper country information
UPDATE addresses 
SET country = 'United States' 
WHERE country IS NULL 
  AND state IN ('NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'VA', 'WA', 'AZ', 'CO', 'IN', 'TN', 'MA', 'MO', 'MD', 'MN', 'WI', 'AL', 'SC', 'LA', 'KY', 'OR', 'OK', 'CT', 'IA', 'MS', 'AR', 'UT', 'NV', 'KS', 'NM', 'NE', 'ID', 'WV', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY');

-- Step 2: Update Canadian addresses
UPDATE addresses 
SET country = 'Canada' 
WHERE country IS NULL 
  AND state IN ('ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT');

-- Step 3: Update UK addresses
UPDATE addresses 
SET country = 'United Kingdom' 
WHERE country IS NULL 
  AND state IN ('England', 'Scotland', 'Wales', 'Northern Ireland');

-- Step 4: Update Australian addresses
UPDATE addresses 
SET country = 'Australia' 
WHERE country IS NULL 
  AND state IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT');

-- Step 5: Update German addresses
UPDATE addresses 
SET country = 'Germany' 
WHERE country IS NULL 
  AND state IN ('BY', 'NW', 'BW', 'HE', 'NI', 'SN', 'RP', 'ST', 'SH', 'TH', 'BE', 'HH', 'MV', 'SL', 'BB', 'HB');

-- Step 6: Update French addresses
UPDATE addresses 
SET country = 'France' 
WHERE country IS NULL 
  AND state IN ('IDF', 'ARA', 'OCC', 'HDF', 'PACA', 'NAQ', 'BFC', 'PDL', 'NOR', 'CVL', 'BRE', 'GES', 'COR');

-- Step 7: Standardize US state abbreviations
UPDATE addresses 
SET state = 'NY' WHERE state = 'New York' AND country = 'United States';
UPDATE addresses 
SET state = 'CA' WHERE state = 'California' AND country = 'United States';
UPDATE addresses 
SET state = 'TX' WHERE state = 'Texas' AND country = 'United States';
UPDATE addresses 
SET state = 'FL' WHERE state = 'Florida' AND country = 'United States';
UPDATE addresses 
SET state = 'IL' WHERE state = 'Illinois' AND country = 'United States';
UPDATE addresses 
SET state = 'PA' WHERE state = 'Pennsylvania' AND country = 'United States';
UPDATE addresses 
SET state = 'OH' WHERE state = 'Ohio' AND country = 'United States';
UPDATE addresses 
SET state = 'GA' WHERE state = 'Georgia' AND country = 'United States';
UPDATE addresses 
SET state = 'NC' WHERE state = 'North Carolina' AND country = 'United States';
UPDATE addresses 
SET state = 'MI' WHERE state = 'Michigan' AND country = 'United States';

-- Step 8: Clean up empty or null values
UPDATE addresses 
SET city = NULL WHERE city = '' OR city = 'null';
UPDATE addresses 
SET state = NULL WHERE state = '' OR state = 'null';
UPDATE addresses 
SET country = NULL WHERE country = '' OR country = 'null';
UPDATE addresses 
SET postal_code = NULL WHERE postal_code = '' OR postal_code = 'null';
UPDATE addresses 
SET street1 = NULL WHERE street1 = '' OR street1 = 'null';

-- Step 9: Mark incomplete addresses for review
UPDATE addresses 
SET street1 = CONCAT(COALESCE(street1, ''), ' [INCOMPLETE ADDRESS]')
WHERE (city IS NULL OR city = '') 
   OR (state IS NULL OR state = '') 
   OR (country IS NULL OR country = '');
