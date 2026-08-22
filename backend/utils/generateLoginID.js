/**
 * Generates a login ID in the format specified in the wireframes:
 *   [Company Initials][First 2 letters of first name + first 2 letters of last name][Year][Serial No]
 *   Example: OIJODO20260001  ->  OI + JO + DO + 2026 + 0001
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {number} joiningYear
 * @param {number} serialNumber - the Nth person to join that year
 * @param {string} companyInitials - defaults to "OI" (Odoo India in the original brief)
 */
function generateLoginID(firstName, lastName, joiningYear, serialNumber, companyInitials = 'OI') {
  const firstPart = firstName.trim().substring(0, 2).toUpperCase();
  const lastPart = lastName.trim().substring(0, 2).toUpperCase();
  const serial = String(serialNumber).padStart(4, '0');
  return `${companyInitials}${firstPart}${lastPart}${joiningYear}${serial}`;
}

module.exports = generateLoginID;
