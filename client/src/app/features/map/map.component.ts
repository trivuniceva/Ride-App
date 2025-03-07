import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { RideService } from '../../core/services/ride/ride.service';
import { Driver } from '../../core/models/driver.model';
import { RouteService } from '../../core/services/route/route.service';
import { Point } from '../../core/models/point.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {
  map: any;
  vehicleMarkers: any = {};
  vehicles: any[] = [];
  vehiclePaths: { [key: number]: [number, number][] } = {};
  currentPathIndex: { [key: number]: number } = {};

  constructor(private rideService: RideService, private routeService: RouteService) { }

  ngOnInit(): void {
    this.initializeMap();
    this.loadActiveRides();
    this.loadRoute(1);  // Učitajte rutu sa ID-om 1
  }

  loadRoute(routeId: number): void {
    this.routeService.getRoutePoints(routeId).subscribe(
      (points: Point[]) => {
        console.log(points);
        if (points && points.length > 0) {
          const latlngs = points.map(point => L.latLng(point.latitude, point.longitude));

          // Kreiraj L.polyline objekat
          const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(this.map);

          // Ako zelis da se mapa automatski prilagodi ruti
          this.map.fitBounds(polyline.getBounds());

        } else {
          console.warn(`Nema tačaka za rutu sa ID-om ${routeId}`);
        }
      },
      (error) => {
        console.error(`Greška pri učitavanju rute sa ID-om ${routeId}:`, error);
      }
    );
  }


  loadActiveRides(): void {
    this.rideService.getActiveRides().subscribe(
      (vehicles) => {
        this.vehicles = vehicles;
        this.vehicles.forEach(vehicle => {
          this.addVehicleMarker(vehicle);
        });
        this.startVehicleMovement();
      },
      (error) => {
        console.error('Greška pri preuzimanju aktivnih vožnji:', error);
      }
    );
  }

  initializeMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  addVehicleMarker(vehicle: Driver): void {
    const customIcon = L.icon({
      iconUrl: 'public/assets/pics/car-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });


    if (vehicle.location && vehicle.location.latitude && vehicle.location.longitude) {
      const marker = L.marker([vehicle.location.latitude, vehicle.location.longitude], { }).addTo(this.map);
      marker.bindPopup(`<b>Vozilo ID: ${vehicle.id}</b><br>Status: ${vehicle.available ? 'slobodno' : 'zauzeto'}`);
      this.vehicleMarkers[vehicle.id] = marker;
    } else {
      console.warn(`Vozilo ${vehicle.id} nema validnu lokaciju. Vozilo ID: ${vehicle.id}, Lokacija:`, vehicle.location);
    }
  }

  startVehicleMovement(): void {
    // Implementirajte logiku za kretanje vozila na osnovu podataka sa backend-a
    // Možete koristiti vehiclePaths i currentPathIndex ako imate podatke o putanjama
  }

  updateVehiclePosition(vehicleId: number, lat: number, lng: number): void {
    const marker = this.vehicleMarkers[vehicleId];
    if (marker) {
      marker.setLatLng([lat, lng]).bindPopup(`<b>Vozilo ID: ${vehicleId}</b><br>Nova pozicija!`).openPopup();
    } else {
      console.warn(`Marker za vozilo ${vehicleId} ne postoji!`);
    }
  }
}
