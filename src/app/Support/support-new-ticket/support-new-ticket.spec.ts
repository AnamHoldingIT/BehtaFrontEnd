import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportNewTicket } from './support-new-ticket';

describe('SupportNewTicket', () => {
  let component: SupportNewTicket;
  let fixture: ComponentFixture<SupportNewTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportNewTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportNewTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
