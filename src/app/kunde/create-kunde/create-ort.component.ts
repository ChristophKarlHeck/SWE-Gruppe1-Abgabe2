/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import type { FormGroup } from '@angular/forms';
import { ORT_REGEX } from '../shared';
import type { OnInit } from '@angular/core';
/**
 * Komponente mit dem Tag &lt;hs-create-ort&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Kunde zu realisieren.
 */
@Component({
    selector: 'hs-create-ort',
    templateUrl: './create-ort.component.html',
})
export class CreateOrtComponent implements OnInit {
    @Input()
    form!: FormGroup;

    readonly ort = new FormControl(undefined, [
        Validators.required,
        Validators.pattern(ORT_REGEX),
    ]);

    ngOnInit() {
        console.log('CreateOrtComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('ort', this.ort);
    }
}
