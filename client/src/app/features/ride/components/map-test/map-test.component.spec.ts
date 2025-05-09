import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTestComponent } from './map-test.component';

describe('MapTestComponent', () => {
  let component: MapTestComponent;
  let fixture: ComponentFixture<MapTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
