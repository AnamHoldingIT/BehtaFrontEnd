import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersLogin } from './users-login';

describe('UsersLogin', () => {
  let component: UsersLogin;
  let fixture: ComponentFixture<UsersLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
