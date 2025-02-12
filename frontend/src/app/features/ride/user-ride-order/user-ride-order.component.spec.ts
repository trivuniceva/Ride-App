import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRideOrderComponent } from './user-ride-order.component';

describe('UserRideOrderComponent', () => {
  let component: UserRideOrderComponent;
  let fixture: ComponentFixture<UserRideOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRideOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRideOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
