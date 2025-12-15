import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportHub } from './support-hub';

describe('SupportHub', () => {
  let component: SupportHub;
  let fixture: ComponentFixture<SupportHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportHub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
