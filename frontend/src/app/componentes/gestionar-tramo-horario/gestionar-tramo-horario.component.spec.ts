import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarTramoHorarioComponent } from './gestionar-tramo-horario.component';

describe('GestionarTramoHorarioComponent', () => {
  let component: GestionarTramoHorarioComponent;
  let fixture: ComponentFixture<GestionarTramoHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarTramoHorarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarTramoHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
