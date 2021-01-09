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

import { KundeService, FindError } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import type { Kunde } from '../shared';
import { Component } from '@angular/core';
import { HttpStatus } from '../../shared';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

/**
 * Komponente f&uuml;r das Tag <code>hs-update-kunde</code> mit Kindkomponenten
 * f&uuml;r die folgenden Tags:
 * <ul>
 *  <li> <code>hs-stammdaten</code>
 *  <li> <code>hs-interessen</code>
 * </ul>
 */
@Component({
    selector: 'hs-update-kunde',
    templateUrl: './update-kunde.component.html',
})
export class UpdateKundeComponent implements OnInit {
    kunde: Kunde | undefined;

    errorMsg: string | undefined;

    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
        private readonly route: ActivatedRoute,
    ) {
        console.log('UpdateKundeComponent.constructor()');
    }

    ngOnInit() {
        // Pfad-Parameter aus /kunden/:id/update
        const id = this.route.snapshot.paramMap.get('id') ?? undefined;

        this.kundeService
            .findById(id)
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();
    }

    private setProps(result: Kunde | FindError) {
        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.kunde = result;
        this.errorMsg = undefined;

        const nachname = `Aktualisieren ${this.kunde._id}`;
        this.titleService.setTitle(nachname);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        console.log(
            `UpdateKundeComponent.handleError(): statuscode=${statuscode}`,
        );

        this.kunde = undefined;

        switch (statuscode) {
            case HttpStatus.NOT_FOUND:
                this.errorMsg = 'Kein Kunde gefunden.';
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
    }
}
