import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverNotificationsComponent } from './driver-notifications.component';

describe('DriverNotificationsComponent', () => {
  let component: DriverNotificationsComponent;
  let fixture: ComponentFixture<DriverNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
