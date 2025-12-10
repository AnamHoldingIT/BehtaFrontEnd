import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPatchnoteList } from './admin-patchnote-list';

describe('AdminPatchnoteList', () => {
  let component: AdminPatchnoteList;
  let fixture: ComponentFixture<AdminPatchnoteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPatchnoteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPatchnoteList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
