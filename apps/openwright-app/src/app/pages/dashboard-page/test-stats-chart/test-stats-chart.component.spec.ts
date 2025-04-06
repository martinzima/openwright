import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStatsChartComponent } from './test-stats-chart.component';

describe('TestStatsChartComponent', () => {
  let component: TestStatsChartComponent;
  let fixture: ComponentFixture<TestStatsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStatsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestStatsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
