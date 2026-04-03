/**
 * Driver photo mappings
 * Maps driver codes to their photo filenames in /public/driver-pictures/
 */

export const driverPhotoMap: Record<string, string> = {
  ALB: 'alex-albon.png',
  SAI: 'carlos-saintz.png',
  LEC: 'charles-leclerc.png',
  OCO: 'esteban-ocon.png',
  ALO: 'fernando-alonso.png',
  COL: 'franco-colapinto.png',
  BOR: 'gabriel-bortoleto.png',
  RUS: 'george-russel.png',
  HAD: 'isack-hadjar.png',
  ANT: 'kimi-antonelli.png',
  STR: 'lance-stroll.png',
  NOR: 'lando-norris.png',
  HAM: 'lewis-hamilton.png',
  LAW: 'liam-lawson.png',
  VER: 'max-verstappen.png',
  HUL: 'nico-hulkenberg.png',
  BEA: 'oliver-bearman.png',
  PIA: 'oscar-piastri.png',
  GAS: 'pierre-gasly.png',
  TSU: 'yuki-tsunoda.png',
}

/**
 * Get driver photo path
 */
export function getDriverPhoto(driverCode: string): string {
  const filename = driverPhotoMap[driverCode.toUpperCase()]
  if (!filename) {
    // Return a placeholder or default image
    return '/logos/f1 car.png'
  }
  return `/driver-pictures/${filename}`
}
