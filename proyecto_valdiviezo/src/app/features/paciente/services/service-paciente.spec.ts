import { TestBed } from '@angular/core/testing';

import { ServicePaciente } from './service-paciente';

describe('ServicePaciente', () => {
  let service: ServicePaciente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicePaciente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
