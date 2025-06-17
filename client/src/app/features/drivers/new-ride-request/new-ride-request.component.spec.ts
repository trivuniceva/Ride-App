import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRideRequestComponent } from './new-ride-request.component';

describe('NewRideRequestComponent', () => {
  let component: NewRideRequestComponent;
  let fixture: ComponentFixture<NewRideRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRideRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRideRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
