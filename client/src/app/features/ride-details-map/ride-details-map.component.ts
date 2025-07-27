import { Component, Input, OnChanges, OnInit, SimpleChanges, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-ride-details-map',
  standalone: true,
  templateUrl: './ride-details-map.component.html',
  styleUrls: ['./ride-details-map.component.css']
})
export class RideDetailsMapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() startCoords: [number, number] | null = null;
  @Input() destinationCoords: [number, number] | null = null;
  @Input() waypointsCoords: [number, number][] = [];
  @Input() routePathCoords: [number, number][] = [];

  private map!: L.Map;
  private routeLine: L.Polyline | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initializeMap();
      this.drawRoute();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      this.drawRoute();
    }
  }

  private initializeMap(): void {
    this.map = L.map('rideDetailsMap').setView([45.2671, 19.8335], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(this.map);

    if (this.startCoords || this.destinationCoords || this.waypointsCoords.length > 0) {
      this.fitMapToBounds();
    }
  }

  private drawRoute(): void {
    if (!this.map) {
      console.warn("Map not initialized yet in RideDetailsMapComponent. Skipping drawRoute.");
      return;
    }

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

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

    if (this.routePathCoords && this.routePathCoords.length > 0) {
      this.routeLine = L.polyline(this.routePathCoords, { color: 'green', weight: 5 }).addTo(this.map);
    }

    if (this.startCoords) {
      L.marker(this.startCoords, { icon: redIcon }).addTo(this.map).bindPopup('Start');
    }
    if (this.destinationCoords) {
      L.marker(this.destinationCoords, { icon: blueIcon }).addTo(this.map).bindPopup('End');
    }
    if (this.waypointsCoords && this.waypointsCoords.length > 0) {
      this.waypointsCoords.forEach((coord, index) => {
        L.marker(coord, { icon: yellowIcon }).addTo(this.map).bindPopup(`Stop ${index + 1}`);
      });
    }

    this.fitMapToBounds();
  }

  private fitMapToBounds(): void {
    const allCoords: [number, number][] = [];
    if (this.startCoords) allCoords.push(this.startCoords);
    if (this.destinationCoords) allCoords.push(this.destinationCoords);
    this.waypointsCoords.forEach(c => allCoords.push(c));
    if (this.routePathCoords && this.routePathCoords.length > 0) {
      this.routePathCoords.forEach(c => allCoords.push(c));
    }

    if (allCoords.length > 0) {
      this.map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
    }
  }
}
