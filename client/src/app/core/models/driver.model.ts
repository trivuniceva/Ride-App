import { Vehicle } from './vehicle.model';
import { Point } from './point.model';
import { User } from './user.model';

export interface Driver extends User {
  available: boolean;
  vehicle: Vehicle;
  location: Point;
  timeOfLogin: string;
  hasFutureDrive: boolean;
  isAvailable: boolean;
}
