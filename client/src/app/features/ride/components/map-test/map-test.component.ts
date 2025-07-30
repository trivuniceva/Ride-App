import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Driver } from '../../../../core/models/driver.model';

@Component({
  selector: 'app-map-test',
  standalone: true,
  templateUrl: './map-test.component.html',
  styleUrls: ['./map-test.component.css'],
})
export class MapTestComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() startCoords: [number, number] | null = null;
  @Input() destinationCoords: [number, number] | null = null;
  @Input() alternativeRoutes: [number, number][] = [];
  @Input() waypointsCoords: [number, number][] = [];
  @Input() drivers: Driver[] = [];

  @Input() activeDriverLocation: [number, number] | null = null;
  @Input() activeDriverId: number | null = null;

  private map!: L.Map;
  private mapInitialized: boolean = false;
  private routeLine: L.Polyline | null = null;
  private driverMarkers: L.Marker[] = [];
  private activeDriverMarker: L.Marker | null = null;
  private activeDriverPathLine: L.Polyline | null = null;

  private activeCarIcon = L.icon({
    iconUrl: 'assets/pics/car-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowSize: [41, 41],
  });

  private greenCarIcon = L.icon({
    iconUrl: 'assets/pics/car-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowSize: [41, 41],
  });

  private redCarIcon = L.icon({
    iconUrl: 'assets/pics/car-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowSize: [41, 41],
  });

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeMap();
    queueMicrotask(() => {
      this.drawInitialMapContent();
    });
  }

  ngAfterViewInit(): void {
    if (this.map) {
      this.map.invalidateSize();
      console.log('Leaflet map size invalidated in ngAfterViewInit.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges (MapTestComponent):', changes);

    if (!this.mapInitialized) {
      console.warn("Map not initialized in ngOnChanges, skipping map operations for now. Will re-evaluate on map init or next change.");
      return;
    }

    if (
      changes['startCoords'] ||
      changes['destinationCoords'] ||
      changes['alternativeRoutes'] ||
      changes['waypointsCoords']
    ) {
      if (this.startCoords && this.destinationCoords && this.alternativeRoutes.length > 0) {
        this.drawRoute();
      } else {
        if (this.routeLine) {
          this.map.removeLayer(this.routeLine);
          this.routeLine = null;
        }
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker && (layer.options as any).isRouteMarker) {
            this.map.removeLayer(layer);
          }
        });
      }
    }

    if (changes['drivers']) {
      this.drawStaticDrivers();
    }

    if (changes['activeDriverLocation'] || changes['activeDriverId']) {
      this.updateActiveDriverLocation();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.mapInitialized = false;
    }
  }

  private initializeMap(): void {
    if (this.mapInitialized) return;

    this.map = L.map('map').setView([45.2396, 19.8227], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(this.map);

    this.mapInitialized = true;
    console.log('Map initialized and mapInitialized flag set to true.');
  }

  private drawInitialMapContent(): void {
    if (!this.mapInitialized) {
      console.error("drawInitialMapContent called but map not initialized! This should not happen.");
      return;
    }
    console.log("drawInitialMapContent called. Drawing initial inputs.");

    if (this.startCoords && this.destinationCoords && this.alternativeRoutes.length > 0) {
      this.drawRoute();
    } else if (this.startCoords || this.destinationCoords) {
      this.drawRoute();
    }


    if (this.drivers && this.drivers.length > 0) {
      this.drawStaticDrivers();
    }

    if (this.activeDriverLocation || this.activeDriverId !== null) {
      this.updateActiveDriverLocation();
    }
  }


  private drawRoute(): void {
    if (!this.mapInitialized) {
      console.warn("Map not initialized, cannot draw route.");
      return;
    }

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer.options as any).isRouteMarker) {
        this.map.removeLayer(layer);
      }
    });

    if (this.alternativeRoutes && this.alternativeRoutes.length > 0) {
      this.routeLine = L.polyline(this.alternativeRoutes, { color: 'green', weight: 5 }).addTo(this.map);
      if (this.routeLine.getLatLngs().length > 0) {
        this.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });
      }
    }


    if (this.startCoords) {
      L.marker(this.startCoords, { icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        }), isRouteMarker: true } as L.MarkerOptions)
        .addTo(this.map)
        .bindPopup('Početak vožnje');
    }

    if (this.destinationCoords) {
      L.marker(this.destinationCoords, { icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        }), isRouteMarker: true } as L.MarkerOptions)
        .addTo(this.map)
        .bindPopup('Odredište');
    }

    this.waypointsCoords.forEach((wp, index) => {
      L.marker(wp, { icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        }), isRouteMarker: true } as L.MarkerOptions)
        .addTo(this.map)
        .bindPopup(`Usputna stanica ${index + 1}`);
    });
  }

  private drawStaticDrivers(): void {
    if (!this.mapInitialized) {
      console.warn("Map not initialized, cannot draw static drivers.");
      return;
    }

    this.driverMarkers.forEach(marker => this.map.removeLayer(marker));
    this.driverMarkers = [];

    if (this.drivers && this.drivers.length > 0) {
      const locationCounts: { [key: string]: number } = {};

      this.drivers.forEach(driver => {
        if (this.activeDriverId && driver.id === this.activeDriverId) {
          return;
        }

        if (driver.location && typeof driver.location.latitude === 'number' && typeof driver.location.longitude === 'number' &&
          !isNaN(driver.location.latitude) && !isNaN(driver.location.longitude)) {

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

          const currentDriverIcon = driver.available ? this.greenCarIcon : this.redCarIcon;

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

  private updateActiveDriverLocation(): void {
    if (!this.mapInitialized) {
      console.warn("Map not initialized, cannot update active driver location.");
      return;
    }

    if (!this.activeDriverLocation || this.activeDriverId === null) {
      if (this.activeDriverMarker) {
        this.map.removeLayer(this.activeDriverMarker);
        this.activeDriverMarker = null;
      }
      if (this.activeDriverPathLine) {
        this.map.removeLayer(this.activeDriverPathLine);
        this.activeDriverPathLine = null;
      }
      this.drawStaticDrivers();
      return;
    }

    const [lat, lng] = this.activeDriverLocation;

    if (!this.activeDriverMarker) {
      this.activeDriverMarker = L.marker([lat, lng], { icon: this.activeCarIcon }).addTo(this.map);
      this.activeDriverMarker.bindPopup(`Vozač ID: ${this.activeDriverId}<br>Aktivna vožnja`).openPopup();
      this.activeDriverPathLine = L.polyline([], { color: 'orange', weight: 4, opacity: 0.7 }).addTo(this.map);

      this.map.setView([lat, lng], 16);
    } else {
      this.activeDriverMarker.setLatLng([lat, lng]);

      if (!this.map.getBounds().contains(L.latLng(lat, lng))) {
        this.map.panTo([lat, lng]);
      }
    }

    if (this.activeDriverPathLine) {
      const latLngs = this.activeDriverPathLine.getLatLngs() as L.LatLng[];
      latLngs.push(L.latLng(lat, lng));
      this.activeDriverPathLine.setLatLngs(latLngs);
    }
  }

  clearActiveDriverPath(): void {
    if (!this.mapInitialized) {
      console.warn("Map not initialized, cannot clear active driver path.");
      return;
    }
    if (this.activeDriverPathLine) {
      this.map.removeLayer(this.activeDriverPathLine);
      this.activeDriverPathLine = null;
    }
    if (this.activeDriverMarker) {
      this.map.removeLayer(this.activeDriverMarker);
      this.activeDriverMarker = null;
    }
    this.drawStaticDrivers();
  }
}
