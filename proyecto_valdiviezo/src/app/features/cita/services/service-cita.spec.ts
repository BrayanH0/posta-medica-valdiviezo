import { TestBed } from '@angular/core/testing';

import { ServiceCita } from './service-cita';

describe('ServiceCita', () => {
  let service: ServiceCita;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceCita);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
