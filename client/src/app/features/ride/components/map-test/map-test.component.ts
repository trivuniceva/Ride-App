import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
  @Input() waypointsCoords: [number, number][] = []; // Dodato waypointsCoords
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
      changes['alternativeRoutes'] ||
      changes['waypointsCoords'] // Dodato waypointsCoords
    ) {
      console.log(this.alternativeRoutes);
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
      maxZoom: 20,
    }).addTo(this.map);
  }

  drawRoute(): void {
    console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    console.log(this.alternativeRoutes);

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const yellowIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const blueIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (this.alternativeRoutes && this.alternativeRoutes.length > 0) {
      console.log('alternativeRoutes:', this.alternativeRoutes);

      this.routeLine = L.polyline(this.alternativeRoutes, { color: 'green' }).addTo(this.map);
      this.map.fitBounds(L.latLngBounds(this.alternativeRoutes));

      if (this.startCoords) {
        L.marker(this.startCoords, { icon: redIcon }).addTo(this.map).bindPopup('Start');
      }

      if (this.destinationCoords) {
        L.marker(this.destinationCoords, { icon: blueIcon }).addTo(this.map).bindPopup('End');
      }
    }

    if (this.waypointsCoords && this.waypointsCoords.length > 0) {
      this.waypointsCoords.forEach((coord, index) => {
        L.marker(coord, { icon: yellowIcon }).addTo(this.map).bindPopup(`Stop ${index + 1}`);
      });
    }
  }
}
