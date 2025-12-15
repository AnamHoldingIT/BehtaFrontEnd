import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportTicketDetail } from './support-ticket-detail';

describe('SupportTicketDetail', () => {
  let component: SupportTicketDetail;
  let fixture: ComponentFixture<SupportTicketDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportTicketDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportTicketDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
