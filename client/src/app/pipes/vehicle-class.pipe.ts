import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vehicleClass'
})
export class VehicleClassPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) {
      return '';
    }

    switch (value.toUpperCase()) {
      case 'STANDARD':
        return 'Standard';
      case 'VAN':
        return 'Van';
      case 'LUXURY':
        return 'Luxury';
      default:
        return value;
    }
  }
}
