import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedRouteFormComponent } from './advanced-route-form.component';

describe('AdvancedRouteFormComponent', () => {
  let component: AdvancedRouteFormComponent;
  let fixture: ComponentFixture<AdvancedRouteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedRouteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedRouteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
