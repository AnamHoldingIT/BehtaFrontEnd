import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchnotesDialog } from './patchnotes-dialog';

describe('PatchnotesDialog', () => {
  let component: PatchnotesDialog;
  let fixture: ComponentFixture<PatchnotesDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatchnotesDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatchnotesDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
