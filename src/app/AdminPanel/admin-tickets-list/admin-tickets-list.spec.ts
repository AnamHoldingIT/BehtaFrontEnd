import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTicketsList } from './admin-tickets-list';

describe('AdminTicketsList', () => {
  let component: AdminTicketsList;
  let fixture: ComponentFixture<AdminTicketsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTicketsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTicketsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
