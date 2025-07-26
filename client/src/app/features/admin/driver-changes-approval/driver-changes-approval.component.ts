import {Component, OnInit} from '@angular/core';
import {Driver} from '../../../core/models/driver.model';
import {DriverUpdateRequest, UserService} from '../../../core/services/user/user.service';
import {User} from '../../../core/models/user.model';
import {CommonModule, NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'app-driver-changes-approval',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule
  ],
  templateUrl: './driver-changes-approval.component.html',
  styleUrl: './driver-changes-approval.component.css'
})

export class DriverChangesApprovalComponent implements OnInit {
  pendingDriverUpdates: DriverUpdateRequest[] = [];
  selectedUpdateRequest: DriverUpdateRequest | null = null;
  showPopup: boolean = false;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.loadPendingDriverUpdates();
  }

  loadPendingDriverUpdates(): void {
    this.userService.getPendingDriverUpdateRequests().subscribe({
      next: (requests: DriverUpdateRequest[]) => {
        this.pendingDriverUpdates = requests;
        console.log('Učitani pending zahtevi za vozače:', this.pendingDriverUpdates);
      },
      error: (error) => {
        console.error('Greška pri dohvatanju pending zahteva za vozače:', error);
      }
    });
  }

  openDriverDetailsPopup(request: DriverUpdateRequest): void {
    this.selectedUpdateRequest = request;
    this.showPopup = true;
  }

  closeDriverDetailsPopup(): void {
    this.showPopup = false;
    this.selectedUpdateRequest = null;
  }

  confirmChange(requestId: number, event: Event): void {
    event.stopPropagation();
    this.userService.approveDriverProfileUpdate(requestId).subscribe({
      next: (response) => {
        alert(response.message);
        this.closeDriverDetailsPopup();
        this.loadPendingDriverUpdates();
      },
      error: (error) => {
        console.error('Greška pri potvrdi promene:', error);
        alert('Greška pri potvrdi promene: ' + (error.error?.error || 'Nepoznata greška.'));
      }
    });
  }

  rejectChange(requestId: number, event: Event): void {
    event.stopPropagation();
    this.userService.rejectDriverProfileUpdate(requestId).subscribe({
      next: (response) => {
        alert(response.message);
        this.closeDriverDetailsPopup();
        this.loadPendingDriverUpdates();
      },
      error: (error) => {
        console.error('Greška pri odbijanju promene:', error);
        alert('Greška pri odbijanju promene: ' + (error.error?.error || 'Nepoznata greška.'));
      }
    });
  }
}
