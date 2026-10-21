import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPaciente } from './main-paciente';

describe('MainPaciente', () => {
  let component: MainPaciente;
  let fixture: ComponentFixture<MainPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
