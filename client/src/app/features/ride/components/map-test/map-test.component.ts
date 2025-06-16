import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Driver } from '../../../../core/models/driver.model';

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
  @Input() waypointsCoords: [number, number][] = [];
  @Input() drivers: Driver[] = [];
  private map!: L.Map;
  private routeLine: L.Polyline | null = null;
  private driverMarkers: L.Marker[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges:', changes);
    if (changes['drivers'] && changes['drivers'].currentValue) {
      this.drawDrivers();
    }
    if (
      changes['startCoords'] ||
      changes['destinationCoords'] ||
      changes['alternativeRoutes'] ||
      changes['waypointsCoords']
    ) {
      if (this.startCoords && this.destinationCoords && this.alternativeRoutes.length > 0) {
        this.drawRoute();
      }
    }
    this.cdr.detectChanges();
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
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker && !this.driverMarkers.includes(layer as L.Marker)) {
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

    if (this.alternativeRoutes && this.alternativeRoutes.length > 0) {
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

  drawDrivers(): void {
    this.driverMarkers.forEach(marker => this.map.removeLayer(marker));
    this.driverMarkers = [];

    if (this.drivers && this.drivers.length > 0) {
      const greenCarIcon = L.icon({
        iconUrl: 'assets/pics/car-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        shadowSize: [41, 41],
      });

      const redCarIcon = L.icon({
        iconUrl: 'assets/pics/car-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        shadowSize: [41, 41],
      });

      const locationCounts: { [key: string]: number } = {};

      this.drivers.forEach(driver => {
        if (
          driver.location &&
          typeof driver.location.latitude === 'number' &&
          typeof driver.location.longitude === 'number' &&
          !isNaN(driver.location.latitude) &&
          !isNaN(driver.location.longitude)
        ) {
          const lat = driver.location.latitude;
          const lng = driver.location.longitude;
          const locationKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

          locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
          const offsetIndex = locationCounts[locationKey] - 1;

          let adjustedLat = lat;
          let adjustedLng = lng;

          if (offsetIndex > 0) {
            const offsetAmount = 0.0001;

            switch (offsetIndex % 8) {
              case 0: adjustedLat += offsetAmount; break;
              case 1: adjustedLat -= offsetAmount; break;
              case 2: adjustedLng += offsetAmount; break;
              case 3: adjustedLng -= offsetAmount; break;
              case 4: adjustedLat += offsetAmount; adjustedLng += offsetAmount; break;
              case 5: adjustedLat += offsetAmount; adjustedLng -= offsetAmount; break;
              case 6: adjustedLat -= offsetAmount; adjustedLng += offsetAmount; break;
              case 7: adjustedLat -= offsetAmount; adjustedLng -= offsetAmount; break;
            }
          }

          const currentDriverIcon = driver.available ? greenCarIcon : redCarIcon;

          const popupContent = `
            <div style="display: flex; flex-direction: column; gap: 5px; padding: 5px; font-family: Arial, sans-serif;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 15px; height: 15px; border-radius: 50%; background-color: ${driver.available ? 'green' : 'red'}; flex-shrink: 0;"></div>
                <div style="font-weight: bold; font-size: 1.1em;">${driver.firstname} ${driver.lastname}</div>
              </div>
              <div>
                <strong>Status:</strong> ${driver.available ? 'Dostupan' : 'Zauzet'}
              </div>
              <div>
                <strong>Buduće vožnje:</strong> ${driver.hasFutureDrive ? 'Da' : 'Ne'}
              </div>
            </div>
          `;

          const marker = L.marker([adjustedLat, adjustedLng], { icon: currentDriverIcon })
            .addTo(this.map)
            .bindPopup(popupContent, { offset: L.point(0, -30) });
          this.driverMarkers.push(marker);
        } else {
          console.warn(`Vozač ${driver.firstname} ${driver.lastname} (ID: ${driver.id}) nema validnu lokaciju za prikaz na mapi.`, driver.location);
        }
      });
    }
  }
}
