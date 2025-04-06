import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRunListComponent } from './test-run-list.component';

describe('TestRunListComponent', () => {
  let component: TestRunListComponent;
  let fixture: ComponentFixture<TestRunListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestRunListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
