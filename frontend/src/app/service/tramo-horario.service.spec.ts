import { TestBed } from '@angular/core/testing';

import { TramoHorarioService } from './tramo-horario.service';

describe('TramoHorarioService', () => {
  let service: TramoHorarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TramoHorarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
