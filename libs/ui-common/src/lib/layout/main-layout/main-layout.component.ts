import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Bell, FolderKanban, GanttChartSquare, HelpCircle, LayoutDashboard, LucideAngularModule, Settings } from 'lucide-angular';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

interface Workspace {
  id: string;
  name: string;
}

@Component({
  selector: 'ow-main-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    LucideAngularModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './main-layout.component.html',
  styles: [],
  animations: [
    trigger('headerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  currentYear = new Date().getFullYear();

  readonly BellIcon = Bell;
  readonly HelpCircleIcon = HelpCircle;

  readonly SettingsIcon = Settings;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly GanttChartSquareIcon = GanttChartSquare;
  readonly TestSuitesIcon = FolderKanban;

  workspaceOptions: Workspace[] = [
    { id: 'ws-1', name: 'Default Workspace' },
    { id: 'ws-2', name: 'Project Phoenix' },
    { id: 'ws-3', name: 'Staging Env' }
  ];
  selectedWorkspace: Workspace | null = this.workspaceOptions[0];

  onWorkspaceChange(event: { value: Workspace | null }): void {
    console.log('Workspace changed:', event.value);
  }
} 