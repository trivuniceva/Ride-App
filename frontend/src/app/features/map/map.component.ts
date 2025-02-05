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
  vehicles = [
    { id: 1, lat: 45.2671, lng: 19.8335, status: 'slobodno' },  // Primer vozila u Novom Sadu
    { id: 2, lat: 45.2695, lng: 19.8325, status: 'zauzeto' }
  ];

  ngOnInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Definiši custom ikonu za marker
    const customIcon = L.icon({
      iconUrl: 'assets/leaflet-icons/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'assets/leaflet-icons/marker-shadow.png',
      shadowSize: [41, 41]
    });

    // Dodaj vozila na mapu sa custom ikonom
    this.vehicles.forEach(vehicle => {
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon }).addTo(this.map);
      marker.bindPopup(`<b>Vozilo ID: ${vehicle.id}</b><br>Status: ${vehicle.status}`);
    });
  }


}
