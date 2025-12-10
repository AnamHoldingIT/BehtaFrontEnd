import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPatchnoteDetails } from './admin-patchnote-details';

describe('AdminPatchnoteDetails', () => {
  let component: AdminPatchnoteDetails;
  let fixture: ComponentFixture<AdminPatchnoteDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPatchnoteDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPatchnoteDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
