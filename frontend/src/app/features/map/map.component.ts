import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  map: any;
  vehicleMarkers: any = {};
  vehicles = [
    { id: 1, lat: 45.2671, lng: 19.8335, status: 'slobodno' },
    { id: 2, lat: 45.2695, lng: 19.8325, status: 'zauzeto' }
  ];

  vehiclePaths: { [key: number]: [number, number][] } = {
    1: [
      [45.2671, 19.8335], [45.2680, 19.8340], [45.2690, 19.8350], [45.2700, 19.8360],
      [45.2715, 19.8370], [45.2730, 19.8380], [45.2745, 19.8390], [45.2760, 19.8400],
      [45.2780, 19.8415], [45.2800, 19.8430]
    ],
    2: [
      [45.2695, 19.8325], [45.2705, 19.8320], [45.2715, 19.8310], [45.2725, 19.8300],
      [45.2740, 19.8290], [45.2760, 19.8280], [45.2780, 19.8270], [45.2800, 19.8260],
      [45.2820, 19.8250], [45.2840, 19.8240]
    ]
  };

  currentPathIndex: { [key: number]: number } = { 1: 0, 2: 0 };

  ngOnInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'assets/pics/car-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet-icons/marker-shadow.png',
      shadowSize: [41, 41]
    });

    this.vehicles.forEach(vehicle => {
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon }).addTo(this.map);
      marker.bindPopup(`<b>Vozilo ID: ${vehicle.id}</b><br>Status: ${vehicle.status}`);
      this.vehicleMarkers[vehicle.id] = marker;
    });

    this.startVehicleMovement();
  }

  startVehicleMovement(): void {
    setInterval(() => {
      this.vehicles.forEach(vehicle => {
        const path = this.vehiclePaths[vehicle.id];
        if (path && this.currentPathIndex[vehicle.id] < path.length - 1) {
          this.currentPathIndex[vehicle.id]++;
          const [newLat, newLng] = path[this.currentPathIndex[vehicle.id]];
          vehicle.lat = newLat;
          vehicle.lng = newLng;
          this.updateVehiclePosition(vehicle.id, newLat, newLng);
        }
      });
      this.map.invalidateSize();
    }, 2000);
  }

  updateVehiclePosition(vehicleId: number, lat: number, lng: number): void {
    const marker = this.vehicleMarkers[vehicleId];
    if (marker) {
      marker.setLatLng([lat, lng]).bindPopup(`<b>Vozilo ID: ${vehicleId}</b><br>Nova pozicija!`).openPopup();
    }
  }
}
