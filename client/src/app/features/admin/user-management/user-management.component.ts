import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { Driver } from '../../../core/models/driver.model';
import { UserService } from '../../../core/services/user/user.service';
import { DriverService } from '../../../core/services/drivers/driver.service';
import { BlockUserDialogComponent } from '../block-user-dialog/block-user-dialog.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  imports: [
    MatTabGroup,
    MatTab,
    MatIconModule,
    NgIf,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  registeredUsers: User[] = [];
  drivers: Driver[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    private driverService: DriverService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsersAndDrivers();
  }

  loadUsersAndDrivers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getAllRegisteredUsers().pipe(
      tap((users: User[]) => this.registeredUsers = users),
      catchError(error => {
        this.errorMessage = 'Failed to load registered users: ' + (error.error?.message || error.message);
        console.error('Error loading registered users:', error);
        return of([]);
      })
    ).subscribe(() => {
      this.driverService.getDrivers().pipe(
        tap((drivers: Driver[]) => this.drivers = drivers),
        catchError(error => {
          this.errorMessage = (this.errorMessage ? this.errorMessage + '\n' : '') + 'Failed to load drivers: ' + (error.error?.message || error.message);
          console.error('Error loading drivers:', error);
          return of([]);
        })
      ).subscribe(() => {
        this.isLoading = false;
      });
    });
  }

  openBlockUserDialog(user: User | Driver, isDriver: boolean): void {
    const dialogRef = this.dialog.open(BlockUserDialogComponent, {
      width: '400px',
      data: {
        userId: user.id,
        isBlocked: !user.isActive,
        blockNote: user.blockNote || null,
        userName: `${user.firstname} ${user.lastname}`,
        userRole: user.userRole,
        isDriver: isDriver
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const request = {
          userId: user.id,
          isBlocked: result.isBlocked,
          blockNote: result.blockNote
        };

        if (isDriver) {
          this.driverService.blockDriver(request).pipe(
            tap((updatedDriver: Driver) => {
              const index = this.drivers.findIndex(d => d.id === updatedDriver.id);
              if (index > -1) {
                this.drivers[index] = updatedDriver;
              }
              alert(`Vozač ${updatedDriver.firstname} ${updatedDriver.lastname} je ${!updatedDriver.isActive ? 'blokiran' : 'odblokiran'}.`);
            }),
            catchError(error => {
              this.errorMessage = `Greška prilikom blokiranja vozača: ${error.error?.message || error.message}`;
              console.error('Error blocking driver:', error);
              return of(null);
            })
          ).subscribe();
        } else {
          this.userService.blockUser(request).pipe(
            tap((updatedUser: User) => {
              const index = this.registeredUsers.findIndex(u => u.id === updatedUser.id);
              if (index > -1) {
                this.registeredUsers[index] = updatedUser;
              }
              alert(`Korisnik ${updatedUser.firstname} ${updatedUser.lastname} je ${!updatedUser.isActive ? 'blokiran' : 'odblokiran'}.`);
            }),
            catchError(error => {
              this.errorMessage = `Greška prilikom blokiranja korisnika: ${error.error?.message || error.message}`;
              console.error('Error blocking user:', error);
              return of(null);
            })
          ).subscribe();
        }
      }
    });
  }
}
