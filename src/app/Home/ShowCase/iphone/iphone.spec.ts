import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iphone } from './iphone';

describe('Iphone', () => {
  let component: Iphone;
  let fixture: ComponentFixture<Iphone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iphone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Iphone);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
