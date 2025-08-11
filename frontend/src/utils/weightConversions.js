/**
 * Weight conversion utilities
 * All internal storage is in kg, conversions are done for display only
 */

// Conversion constants
const KG_TO_LBS = 2.20462262185
const LBS_TO_KG = 0.45359237

/**
 * Convert kilograms to pounds
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export function kgToLbs(kg) {
  if (typeof kg !== 'number' || isNaN(kg)) return 0
  return Math.round((kg * KG_TO_LBS) * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert pounds to kilograms
 * @param {number} lbs - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export function lbsToKg(lbs) {
  if (typeof lbs !== 'number' || isNaN(lbs)) return 0
  return Math.round((lbs * LBS_TO_KG) * 100) / 100 // Round to 2 decimal places for storage
}

/**
 * Format weight for display based on unit preference
 * @param {number} kg - Weight in kilograms (internal storage)
 * @param {string} displayUnit - 'kg' or 'lbs'
 * @returns {string} Formatted weight string
 */
export function formatWeight(kg, displayUnit = 'kg') {
  if (typeof kg !== 'number' || isNaN(kg)) return '0'
  
  if (displayUnit === 'lbs') {
    const lbs = kgToLbs(kg)
    return lbs.toFixed(1)
  } else {
    return kg.toFixed(1)
  }
}

/**
 * Get weight value for display
 * @param {number} kg - Weight in kilograms (internal storage)
 * @param {string} displayUnit - 'kg' or 'lbs'
 * @returns {number} Weight value in the requested unit
 */
export function getWeightForDisplay(kg, displayUnit = 'kg') {
  if (typeof kg !== 'number' || isNaN(kg)) return 0
  
  if (displayUnit === 'lbs') {
    return kgToLbs(kg)
  } else {
    return kg
  }
}

/**
 * Convert display weight to internal storage (kg)
 * @param {number} weight - Weight value from user input
 * @param {string} inputUnit - 'kg' or 'lbs'
 * @returns {number} Weight in kilograms for storage
 */
export function convertToKg(weight, inputUnit = 'kg') {
  if (typeof weight !== 'number' || isNaN(weight)) return 0
  
  if (inputUnit === 'lbs') {
    return lbsToKg(weight)
  } else {
    return weight
  }
}

/**
 * Validate weight input based on unit
 * @param {number} weight - Weight value
 * @param {string} unit - 'kg' or 'lbs'
 * @returns {boolean} Whether the weight is valid
 */
export function validateWeight(weight, unit = 'kg') {
  if (typeof weight !== 'number' || isNaN(weight)) return false
  
  const minWeight = unit === 'kg' ? 20 : 44 // 20 kg or 44 lbs minimum
  const maxWeight = unit === 'kg' ? 300 : 661 // 300 kg or 661 lbs maximum
  
  return weight >= minWeight && weight <= maxWeight
}

/**
 * Get weight change for display
 * @param {number} changeKg - Weight change in kilograms
 * @param {string} displayUnit - 'kg' or 'lbs'
 * @returns {string} Formatted weight change
 */
export function formatWeightChange(changeKg, displayUnit = 'kg') {
  if (typeof changeKg !== 'number' || isNaN(changeKg)) return '0'
  
  const change = getWeightForDisplay(changeKg, displayUnit)
  if (change === 0) return '0'
  
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}`
}

/**
 * Get average weight for display
 * @param {number} avgKg - Average weight in kilograms
 * @param {string} displayUnit - 'kg' or 'lbs'
 * @returns {string} Formatted average weight
 */
export function formatAverageWeight(avgKg, displayUnit = 'kg') {
  if (typeof avgKg !== 'number' || isNaN(avgKg) || avgKg <= 0) return '0'
  
  const avg = getWeightForDisplay(avgKg, displayUnit)
  return avg.toFixed(1)
} 