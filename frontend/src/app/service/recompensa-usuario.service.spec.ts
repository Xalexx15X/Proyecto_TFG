import { TestBed } from '@angular/core/testing';

import { RecompensaUsuarioService } from './recompensa-usuario.service';

describe('RecompensaUsuarioService', () => {
  let service: RecompensaUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecompensaUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
