import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivcayPolicayComponent } from './privcay-policay.component';

describe('PrivcayPolicayComponent', () => {
  let component: PrivcayPolicayComponent;
  let fixture: ComponentFixture<PrivcayPolicayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrivcayPolicayComponent]
    });
    fixture = TestBed.createComponent(PrivcayPolicayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
