import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComponent } from './checkout.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SignedInGuard } from '../../core/guards/signedin.guard';
import { LoadingModule } from '../../shared/loading/loading.module';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: CheckoutComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [CheckoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    SharedModule,
    LoadingModule,
    RouterModule.forChild(routes),
    // Material Modules
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatInputModule,
    MatDividerModule,
  ],
  providers: [AuthGuard, SignedInGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CheckoutModule {}
