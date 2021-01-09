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

import { KundeService, UpdateError } from '../../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HOME_PATH, HttpStatus } from '../../../shared';
import type { Kunde } from '../../shared';
import { HttpErrorResponse } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first } from 'rxjs/operators';

/**
 * Komponente f&uuml;r das Tag <code>hs-interessen</code>
 */
@Component({
    selector: 'hs-update-interessen',
    templateUrl: './update-interessen.component.html',
})
export class UpdateInteressenComponent implements OnInit {
    // <hs-update-interessen [kunde]="...">
    @Input()
    kunde!: Kunde;

    form!: FormGroup;

    lesen!: FormControl;

    reisen!: FormControl;

    sport!: FormControl;

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly kundeService: KundeService,
        private readonly router: Router,
    ) {
        console.log('UpdateInteressenComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Interessenn des zu &auml;ndernden Kundes vorbelegen.
     */
    ngOnInit() {
        console.log('kunde=', this.kunde);

        // Definition und Vorbelegung der Eingabedaten (hier: Checkbox)
        const hasLesen = this.kunde.hasSchlagwort('LESEN');
        this.lesen = new FormControl(hasLesen);
        const hasReisen = this.kunde.hasSchlagwort('REISEN');
        this.reisen = new FormControl(hasReisen);
        const hasSport = this.kunde.hasSchlagwort('Sport');
        this.sport = new FormControl(hasSport);

        this.form = new FormGroup({
            // siehe ngFormControl innerhalb von @Component({template: `...`})
            lesen: this.lesen,
            reisen: this.reisen,
            sport: this.sport,
        });
    }

    /**
     * Die aktuellen Interessen f&uuml;r das angezeigte kunde-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onUpdate() {
        if (this.form.pristine) {
            console.log(
                'UpdateInteressenComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        this.kunde.updateInteressen(
            this.lesen.value,
            this.reisen.value,
            this.sport.value,
        );
        console.log('kunde=', this.kunde);

        const next = async (result: Kunde | UpdateError) => {
            if (result instanceof UpdateError) {
                this.handleError(result);
                return;
            }

            await this.router.navigate([HOME_PATH]);
        };
        this.kundeService.update(this.kunde).pipe(first()).subscribe({ next });

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false;
    }

    private handleError(err: UpdateError) {
        const { statuscode } = err;
        console.log(
            `UpdateInteressenComponent.handleError(): statuscode=${statuscode}`,
        );

        switch (statuscode) {
            case HttpStatus.BAD_REQUEST:
                // TODO Aufbereitung der Fehlermeldung: u.a. Anfuehrungszeichen
                this.errorMsg =
                    err.cause instanceof HttpErrorResponse
                        ? err.cause.error
                        : JSON.stringify(err.cause);
                break;
            case HttpStatus.TOO_MANY_REQUESTS:
                this.errorMsg =
                    'Zu viele Anfragen. Bitte versuchen Sie es später noch einmal.';
                break;
            case HttpStatus.GATEWAY_TIMEOUT:
                this.errorMsg = 'Ein interner Fehler ist aufgetreten.';
                console.error('Laeuft der Appserver? Port-Forwarding?');
                break;
            default:
                this.errorMsg = 'Ein unbekannter Fehler ist aufgetreten.';
                break;
        }

        console.log(
            `UpdateInteressenComponent.handleError(): errorMsg=${this.errorMsg}`,
        );
    }
}
