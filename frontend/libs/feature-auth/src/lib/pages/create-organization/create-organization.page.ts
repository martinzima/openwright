import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { FormlyModule } from '@ngx-formly/core';
import { CreateOrganizationStore } from './create-organization.store';
import { CommonFormComponent } from '@openwright/ui-common';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'ow-create-organization-page',
  templateUrl: './create-organization.page.html',
  styleUrls: ['./create-organization.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    FormlyModule,
    LucideAngularModule,
    InputTextModule,
    CommonFormComponent
],
  providers: [CreateOrganizationStore],
})
export class CreateOrganizationPageComponent {
  readonly store = inject(CreateOrganizationStore);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly ArrowRightIcon = ArrowRight;

  constructor() {
    explicitEffect([this.authService.me], ([me]) => {
      if (this.authService.isAuthenticated()) {
        if (!this.authService.user()) {
          this.router.navigate(['/create-account']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit() {
    this.store.submit();
  }
}