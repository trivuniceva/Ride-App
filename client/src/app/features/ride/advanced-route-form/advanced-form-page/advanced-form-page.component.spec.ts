import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedFormPageComponent } from './advanced-form-page.component';

describe('AdvancedFormPageComponent', () => {
  let component: AdvancedFormPageComponent;
  let fixture: ComponentFixture<AdvancedFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedFormPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
