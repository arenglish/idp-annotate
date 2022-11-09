import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaskOverlayCanvasComponent } from './mask-overlay-canvas.component';

describe('MaskOverlayCanvasComponent', () => {
  let component: MaskOverlayCanvasComponent;
  let fixture: ComponentFixture<MaskOverlayCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaskOverlayCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaskOverlayCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
