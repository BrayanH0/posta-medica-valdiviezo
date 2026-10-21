import { TestBed } from '@angular/core/testing';

import { ServiceMedico } from './service-medico';

describe('ServiceMedico', () => {
  let service: ServiceMedico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceMedico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
