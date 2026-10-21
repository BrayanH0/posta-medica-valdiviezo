import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMedico } from './main-medico';

describe('MainMedico', () => {
  let component: MainMedico;
  let fixture: ComponentFixture<MainMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
