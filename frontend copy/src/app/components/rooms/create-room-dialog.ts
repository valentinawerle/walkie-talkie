import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-room-dialog',
  template: `
    <h2 mat-dialog-title>Crear nueva sala</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre de la sala</mat-label>
        <input matInput formControlName="name" maxlength="30" required>
        <mat-error *ngIf="form.get('name')?.hasError('required')">
          El nombre es obligatorio
        </mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Descripción</mat-label>
        <input matInput formControlName="description" maxlength="100">
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Máximo de miembros</mat-label>
        <input matInput type="number" formControlName="maxMembers" min="2" max="50">
        <mat-error *ngIf="form.get('maxMembers')?.hasError('min') || form.get('maxMembers')?.hasError('max')">
          Debe ser entre 2 y 50
        </mat-error>
      </mat-form-field>
      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Crear</button>
      </div>
    </form>
  `,
  styles: [`.full-width { width: 100%; }`],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatDialogModule]
})
export class CreateRoomDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      maxMembers: [10, [Validators.min(2), Validators.max(50)]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.form.value, isPrivate: false });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
