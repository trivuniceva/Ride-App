import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [],
  templateUrl: './vehicle-type.component.html',
  styleUrl: './vehicle-type.component.css'
})
export class VehicleTypeComponent {
  @Output() classSelected = new EventEmitter<string>();
  activeClass: string | null = null;

  selectClass(className: string): void {
    this.activeClass = className;
    this.classSelected.emit(className);
  }

}
