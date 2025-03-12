import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-route-info',
  standalone: true,
  imports: [],
  templateUrl: './route-info.component.html',
  styleUrl: './route-info.component.css'
})
export class RouteInfoComponent {
  @Input() distance: number | undefined;
  @Input() duration: number | undefined;
  @Input() price: number | undefined;


}
