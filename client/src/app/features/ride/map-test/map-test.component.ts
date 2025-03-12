import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-test',
  standalone: true,
  templateUrl: './map-test.component.html',
  styleUrls: ['./map-test.component.css'],
})

export class MapTestComponent implements OnInit, OnChanges {
  @Input() startCoords: [number, number] | null = null;
  @Input() destinationCoords: [number, number] | null = null;
  @Input() alternativeRoutes: [number, number][] = [];
  private map!: L.Map;
  private routeLine: L.Polyline | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges:', changes);
    if (
      changes['startCoords'] ||
      changes['destinationCoords'] ||
      changes['alternativeRoutes']
    ) {
      console.log(this.alternativeRoutes)
      if (this.startCoords && this.destinationCoords && this.alternativeRoutes.length > 0) {
        this.drawRoute();
        this.cdr.detectChanges();
      }
    }
  }


  initializeMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);
  }

  drawRoute(): void {
    console.log(" >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    console.log(this.alternativeRoutes)

    if (this.alternativeRoutes && this.alternativeRoutes.length > 0) {
      console.log('alternativeRoutes:', this.alternativeRoutes);

      this.routeLine = L.polyline(this.alternativeRoutes, { color: 'green' }).addTo(this.map);
      this.map.fitBounds(L.latLngBounds(this.alternativeRoutes));
    }
  }

}
