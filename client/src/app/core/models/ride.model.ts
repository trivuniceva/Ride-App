import {PointDTO} from './PointDTO.model';

export interface Ride {
  id: number;
  startAddress: string;
  stops: string[];
  destinationAddress: string;
  startLocation: PointDTO;
  destinationLocation: PointDTO;
  stopLocations: PointDTO[];
  vehicleType: string;
  carriesBabies: boolean;
  carriesPets: boolean;
  passengers: string[];
  paymentStatus: string;
  fullPrice: number;
  requestorEmail: string;
  createdAt: string;
  rideStatus: string;
  expectedTime: number;
  totalLength: number;
  driverId: number;
  refusedDriverIds: number[];
}
