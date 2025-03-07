import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversAvailabilityComponent } from './drivers-availability.component';

describe('DriversAvailabilityComponent', () => {
  let component: DriversAvailabilityComponent;
  let fixture: ComponentFixture<DriversAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriversAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriversAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
