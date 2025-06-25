import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideTrackingPopupComponent } from './ride-tracking-popup.component';

describe('RideTrackingPopupComponent', () => {
  let component: RideTrackingPopupComponent;
  let fixture: ComponentFixture<RideTrackingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideTrackingPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideTrackingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
