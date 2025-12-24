import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../core/interfaces/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false,
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.loadUserData();
    this.initializeForm();
  }

  loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  initializeForm(): void {
    const userData = localStorage.getItem('userData');
    const userAddress = userData ? JSON.parse(userData).address || '' : '';

    this.profileForm = this.fb.group({
      name: [
        this.user?.name || '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [
        { value: this.user?.email || '', disabled: true },
        [Validators.required, Validators.email],
      ],
      address: [userAddress, [Validators.required, Validators.minLength(10)]],
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      const userData = localStorage.getItem('userData');
      const userAddress = userData ? JSON.parse(userData).address || '' : '';
      this.profileForm.patchValue({
        name: this.user?.name,
        address: userAddress,
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      const updatedName = this.profileForm.get('name')?.value;
      const updatedAddress = this.profileForm.get('address')?.value;
      this.user.name = updatedName;

      const userData = localStorage.getItem('userData');
      if (userData) {
        const userObj = JSON.parse(userData);
        userObj.name = updatedName;
        userObj.address = updatedAddress;
        localStorage.setItem('userData', JSON.stringify(userObj));
      }

      this.isEditMode = false;
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    const userData = localStorage.getItem('userData');
    const userAddress = userData ? JSON.parse(userData).address || '' : '';
    this.profileForm.patchValue({
      name: this.user?.name,
      address: userAddress,
    });
  }
}
