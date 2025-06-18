import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-ride-request-popup',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './ride-request-popup.component.html',
  styleUrl: './ride-request-popup.component.css'
})
export class RideRequestPopupComponent {

  @Input() visible = false;
  @Input() message: string = '';
  @Output() accept = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

}
