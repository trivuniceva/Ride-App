import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteInfoComponent } from './route-info.component';

describe('RouteInfoComponent', () => {
  let component: RouteInfoComponent;
  let fixture: ComponentFixture<RouteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
