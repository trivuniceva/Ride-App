import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideDetailsDialogComponent } from './ride-details-dialog.component';

describe('RideDetailsDialogComponent', () => {
  let component: RideDetailsDialogComponent;
  let fixture: ComponentFixture<RideDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
