import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarRecompensasComponent } from './gestionar-recompensas.component';

describe('GestionarRecompensasComponent', () => {
  let component: GestionarRecompensasComponent;
  let fixture: ComponentFixture<GestionarRecompensasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarRecompensasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarRecompensasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
