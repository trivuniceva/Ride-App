import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitFareComponent } from './split-fare.component';

describe('SplitFareComponent', () => {
  let component: SplitFareComponent;
  let fixture: ComponentFixture<SplitFareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitFareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitFareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
