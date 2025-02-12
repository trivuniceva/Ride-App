import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideOrderComponent } from './ride-order.component';

describe('RideOrderComponent', () => {
  let component: RideOrderComponent;
  let fixture: ComponentFixture<RideOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
