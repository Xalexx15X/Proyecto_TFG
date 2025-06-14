import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarCiudadesComponent } from './gestionar-ciudades.component';

describe('GestionarCiudadesComponent', () => {
  let component: GestionarCiudadesComponent;
  let fixture: ComponentFixture<GestionarCiudadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarCiudadesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarCiudadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
