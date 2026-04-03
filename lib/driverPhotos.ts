import { getDriverPhotoPath } from './seasonMetadata'

/**
 * Get driver photo path
 */
export function getDriverPhoto(driverCode: string): string {
  return getDriverPhotoPath(driverCode) ?? '/logos/f1 car.png'
}
