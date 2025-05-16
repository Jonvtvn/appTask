import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <span class="mb-4 text-md font-medium text-neutral-900">Are you sure you want to delete the task:</span>
        <p class="mb-4 text-lg w-full break-words text-neutral-900">{{ message }}</p>

        <div class="flex justify-end gap-4">
          <button (click)="cancel()" class="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400">Cancel</button>
          <button (click)="confirm()" class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-400">Confirm</button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
    @Input() message: string = 'Are you sure?';
    @Output() onConfirm = new EventEmitter<void>();
    @Output() onCancel = new EventEmitter<void>();

    confirm() {
        this.onConfirm.emit();
    }

    cancel() {
        this.onCancel.emit();
    }
}
