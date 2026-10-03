import { Injectable } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(message: string): void {
    toast(message);
  }
}
