import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CantEstadoCita } from './cant-estado-cita';

describe('CantEstadoCita', () => {
  let component: CantEstadoCita;
  let fixture: ComponentFixture<CantEstadoCita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CantEstadoCita]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CantEstadoCita);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
