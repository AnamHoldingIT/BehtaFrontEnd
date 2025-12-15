import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Decription } from './decription';

describe('Decription', () => {
  let component: Decription;
  let fixture: ComponentFixture<Decription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Decription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Decription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
