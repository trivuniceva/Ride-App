import {Vehicle} from './vehicle.model';
import {Point} from './point.model';

export interface Driver {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  isBlocked: boolean;
  isAvailable: boolean;
  vehicle: Vehicle;
  location: Point;
  timeOfLogin: string;
  hasFutureDrive: boolean;
}
