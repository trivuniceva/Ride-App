import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRequestPopupComponent } from './ride-request-popup.component';

describe('RideRequestPopupComponent', () => {
  let component: RideRequestPopupComponent;
  let fixture: ComponentFixture<RideRequestPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideRequestPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
