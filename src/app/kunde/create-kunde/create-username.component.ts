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
import type { OnInit } from '@angular/core';

/**
 * Komponente mit dem Tag &lt;hs-create-username&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    // moduleId: module.id,
    selector: 'hs-create-username',
    templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent implements OnInit {
    private static readonly MIN_LENGTH = 2;

    @Input()
    form!: FormGroup;

    // Keine Vorbelegung bzw. der leere String, da es Placeholder gibt
    // Varianten fuer Validierung:
    //    serverseitig mittels Request/Response
    //    clientseitig bei den Ereignissen keyup, change, blur, ...
    // Ein Endbenutzer bewirkt staendig einen neuen Fehlerstatus
    readonly username = new FormControl(undefined, [
        Validators.required,
        Validators.minLength(CreateUsernameComponent.MIN_LENGTH),
        Validators.pattern(/^\w/u),
    ]);
    // readonly usernameGroup = new FormGroup({ username: this.username })

    ngOnInit() {
        console.log('CreateUsernameComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('username', this.username);
    }
}
