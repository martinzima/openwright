import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { BellIcon, ChartNoAxesColumnIcon, HelpCircleIcon, HouseIcon, LayersIcon, LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

interface Workspace {
  id: string;
  name: string;
}

@Component({
  selector: 'ow-header',
  standalone: true,
  imports: [
    CommonModule, // Needed for ngModel
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    LucideAngularModule,
    SelectModule,
    FormsModule,
    SvgIconComponent
  ],
  templateUrl: './header.component.html',
  animations: [
    trigger('headerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly BellIcon = BellIcon;
  readonly HelpCircleIcon = HelpCircleIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly HouseIcon = HouseIcon;
  readonly ChartNoAxesColumnIcon = ChartNoAxesColumnIcon;
  readonly LayersIcon = LayersIcon;

  workspaceOptions: Workspace[] = [
    { id: 'ws-1', name: 'Default Workspace' },
    { id: 'ws-2', name: 'Project Phoenix' },
    { id: 'ws-3', name: 'Staging Env' }
  ];
  selectedWorkspace: Workspace | null = this.workspaceOptions[0];

  onWorkspaceChange(event: { value: Workspace | null }): void {
    console.log('Workspace changed:', event.value);
    // Add actual workspace change logic here
  }
}
