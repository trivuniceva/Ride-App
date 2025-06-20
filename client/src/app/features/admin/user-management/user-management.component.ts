import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
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
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
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

  registeredUsersDataSource = new MatTableDataSource<User>();
  driversDataSource = new MatTableDataSource<Driver>();

  constructor(
    private userService: UserService,
    private driverService: DriverService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRegisteredUsers();
    this.loadDrivers();
  }

  loadRegisteredUsers(): void {
    this.isLoading = true;
    this.userService.getAllRegisteredUsers().subscribe({
      next: (users) => {
        this.registeredUsers = users;
        this.registeredUsersDataSource.data = users;
        this.isLoading = false;
      },

      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju registrovanih korisnika.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.driverService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.driversDataSource.data = drivers;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju vozača.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  openBlockUserDialog(user: User | Driver, isDriver: boolean): void {
    const dialogRef = this.dialog.open(BlockUserDialogComponent, {
      width: '500px',
      data: {
        userId: user.id,
        isCurrentlyActive: user.active,
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
          isBlocked: !result.isCurrentlyActive,
          blockNote: result.blockNote
        };

        if (isDriver) {
          this.driverService.blockDriver(request).pipe(
            tap((updatedDriver: Driver) => {
              console.log('Driver BEFORE update:', this.drivers.find(d => d.id === updatedDriver.id));
              console.log('Driver AFTER update (from backend response):', updatedDriver);

              this.drivers = this.drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d);
              this.driversDataSource.data = this.drivers;
              this.cdr.detectChanges();
              alert(`Vozač ${updatedDriver.firstname} ${updatedDriver.lastname} je ${!updatedDriver.active ? 'blokiran' : 'odblokiran'}.`);
            }),
            catchError(error => {
              this.errorMessage = `Greška prilikom ${request.isBlocked ? 'blokiranja' : 'odblokiranja'} vozača: ${error.error?.message || error.message}`;
              console.error('Error blocking driver:', error);
              return of(null);
            })
          ).subscribe();
        } else {
          this.userService.blockUser(request).pipe(
            tap((updatedUser: User) => {
              console.log('User BEFORE update:', this.registeredUsers.find(u => u.id === updatedUser.id));
              console.log('User AFTER update (from backend response):', updatedUser);

              this.registeredUsers = this.registeredUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
              this.registeredUsersDataSource.data = this.registeredUsers;
              this.cdr.detectChanges();
              alert(`Korisnik ${updatedUser.firstname} ${updatedUser.lastname} je ${!updatedUser.active ? 'blokiran' : 'odblokiran'}.`);
            }),
            catchError(error => {
              this.errorMessage = `Greška prilikom ${request.isBlocked ? 'blokiranja' : 'odblokiranja'} korisnika: ${error.error?.message || error.message}`;
              console.error('Error blocking user:', error);
              return of(null);
            })
          ).subscribe();
        }
      }
    });
  }
}
