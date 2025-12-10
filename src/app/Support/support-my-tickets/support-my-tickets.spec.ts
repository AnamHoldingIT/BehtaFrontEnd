import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportMyTickets } from './support-my-tickets';

describe('SupportMyTickets', () => {
  let component: SupportMyTickets;
  let fixture: ComponentFixture<SupportMyTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportMyTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportMyTickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
