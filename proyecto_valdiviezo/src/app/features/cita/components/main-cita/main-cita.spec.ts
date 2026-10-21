import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCita } from './main-cita';

describe('MainCita', () => {
  let component: MainCita;
  let fixture: ComponentFixture<MainCita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCita]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCita);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
