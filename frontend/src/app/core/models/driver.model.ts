import {Vehicle} from './vehicle.model';
import {Point} from './point.model';

export interface Driver {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  isBlocked: boolean;
  available: boolean;
  // vehicle: Vehicle;
  location: Point;
  timeOfLogin: string;
  hasFutureDrive: boolean;
}
