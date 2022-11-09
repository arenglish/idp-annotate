import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationControlsComponent } from './annotation-controls.component';

describe('AnnotationControlsComponent', () => {
  let component: AnnotationControlsComponent;
  let fixture: ComponentFixture<AnnotationControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
