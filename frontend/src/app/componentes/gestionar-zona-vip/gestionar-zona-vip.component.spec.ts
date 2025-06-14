import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarZonaVipComponent } from './gestionar-zona-vip.component';

describe('GestionarZonaVipComponent', () => {
  let component: GestionarZonaVipComponent;
  let fixture: ComponentFixture<GestionarZonaVipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarZonaVipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarZonaVipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
