import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverRideTrackingMapComponent } from './driver-ride-tracking-map.component';

describe('DriverRideTrackingMapComponent', () => {
  let component: DriverRideTrackingMapComponent;
  let fixture: ComponentFixture<DriverRideTrackingMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverRideTrackingMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverRideTrackingMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
