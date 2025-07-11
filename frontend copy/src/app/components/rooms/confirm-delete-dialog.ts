import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Eliminar sala</h2>
    <mat-dialog-content>
      <p>¿Estás seguro de que deseas eliminar esta sala? Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="onDelete()">Eliminar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule]
})
export class ConfirmDeleteDialogComponent {
  constructor(private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onDelete() {
    this.dialogRef.close(true);
  }
}
