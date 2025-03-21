import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-additional-options',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './additional-options.component.html',
  styleUrl: './additional-options.component.css'
})
export class AdditionalOptionsComponent {
  @Output() optionsChanged = new EventEmitter<{ carriesBabies: boolean, carriesPets: boolean }>();

  carriesBabies: boolean = false;
  carriesPets: boolean = false;

  emitOptions() {
    this.optionsChanged.emit({ carriesBabies: this.carriesBabies, carriesPets: this.carriesPets });
  }

  onCarriesBabiesChange() {
    this.emitOptions();
  }

  onCarriesPetsChange() {
    this.emitOptions();
  }

}
