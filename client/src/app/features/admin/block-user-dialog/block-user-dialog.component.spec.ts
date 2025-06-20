import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockUserDialogComponent } from './block-user-dialog.component';

describe('BlockUserDialogComponent', () => {
  let component: BlockUserDialogComponent;
  let fixture: ComponentFixture<BlockUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockUserDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
