import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTicketsDetail } from './admin-tickets-detail';

describe('AdminTicketsDetail', () => {
  let component: AdminTicketsDetail;
  let fixture: ComponentFixture<AdminTicketsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTicketsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTicketsDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
