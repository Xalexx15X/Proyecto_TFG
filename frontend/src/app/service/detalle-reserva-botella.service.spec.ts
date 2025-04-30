import { TestBed } from '@angular/core/testing';

import { DetalleReservaBotellaService } from './detalle-reserva-botella.service';

describe('DetalleReservaBotellaService', () => {
  let service: DetalleReservaBotellaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetalleReservaBotellaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
