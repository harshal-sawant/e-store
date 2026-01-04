import { Component } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { User } from 'client/shop/src/app/core/interfaces/user.model';
import { BaseComponent } from 'global/base/base.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: false,
})
export class AuthComponent extends BaseComponent {
  isLoginMode: boolean = true;
  submitted: boolean = false;
  authError!: any;
  constructor(private authService: AuthService) {
    super();
  }
  onSignupSwitch() {
    this.isLoginMode = false;
  }
  onLoginSwitch() {
    this.isLoginMode = true;
  }
  onSubmit(form: NgForm) {
    const email = form.controls['email'];
    const password = form.controls['password'];
    this.authService
      .signIn(email.value, password.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (authResponse) => {
          let user = new User(
            authResponse._id,
            authResponse.name,
            authResponse.email,
            authResponse.role,
            authResponse.token,
            authResponse.expiresIn
          );
          if (user && user.role === 'admin') {
            localStorage.setItem('adminData', JSON.stringify(user));
          }
          window.location.reload();
        },
        (err) => {
          this.authError = err;
        }
      );
    if (this.isLoginMode) {
    } else if (!this.isLoginMode) {
    }
    this.submitted = true;
  }
  isShowEmail: boolean = true;
  toggleDefaultEmail() {
    this.isShowEmail = !this.isShowEmail;
  }
}
