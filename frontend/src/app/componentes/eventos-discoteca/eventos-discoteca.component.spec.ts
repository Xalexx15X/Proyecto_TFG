import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosDiscotecaComponent } from './eventos-discoteca.component';

describe('EventosDiscotecaComponent', () => {
  let component: EventosDiscotecaComponent;
  let fixture: ComponentFixture<EventosDiscotecaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosDiscotecaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventosDiscotecaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
