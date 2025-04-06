import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { LucideAngularModule, Bell, HelpCircle, Settings, LayoutDashboard, GanttChartSquare, FolderKanban } from 'lucide-angular';

interface Workspace {
  id: string;
  name: string;
}

@Component({
  selector: 'ow-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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