import {Component, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'app-route-form',
    imports: [],
    templateUrl: './route-form.component.html',
    styleUrl: './route-form.component.css'
})
export class RouteFormComponent {
  @Output() routeDataSubmitted = new EventEmitter<{ startAddress: string, destinationAddress: string }>();

  submitRouteData(startAddress: string, destinationAddress: string): void {
    this.routeDataSubmitted.emit({ startAddress, destinationAddress });
  }

}
