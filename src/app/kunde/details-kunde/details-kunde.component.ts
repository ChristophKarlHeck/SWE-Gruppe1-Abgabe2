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

import { first, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { AuthService } from '../../auth/auth.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import type { Kunde } from '../shared';
import { KundeService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component } from '@angular/core';
import { FindError } from './../shared/errors';
import { HttpStatus } from '../../shared';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

/**
 * Komponente f&uuml;r das Tag <code>hs-details-kunde</code>
 */
@Component({
    selector: 'hs-details-kunde',
    templateUrl: './details-kunde.component.html',
})
export class DetailsKundeComponent implements OnInit {
    waiting = true;

    kunde: Kunde | undefined;

    errorMsg: string | undefined;

    isAdmin!: boolean;

    // eslint-disable-next-line max-params
    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
        private readonly route: ActivatedRoute,
        private readonly authService: AuthService,
    ) {
        console.log('DetailsKundeComponent.constructor()');
    }

    ngOnInit() {
        // Pfad-Parameter aus /kunden/:id beobachten, ohne dass
        // bisher ein JavaScript-Ereignis, wie z.B. click, eingetreten ist.
        // UUID (oder Mongo-ID) ist ein String

        const id = this.route.snapshot.paramMap.get('id') ?? undefined;
        console.log('DetailsKundeComponent.ngOnInit(): id=', id);

        this.kundeService
            .findById(id)
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();

        // Initialisierung, falls zwischenzeitlich der Browser geschlossen wurde
        this.isAdmin = this.authService.isAdmin;
    }

    private setProps(result: Kunde | FindError) {
        this.waiting = false;

        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.kunde = result;
        this.errorMsg = undefined;

        const nachname = `Details ${this.kunde._id}`;
        this.titleService.setTitle(nachname);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        console.log(`DetailsComponent.handleError(): statuscode=${statuscode}`);

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

        this.titleService.setTitle('Fehler');
    }
}
