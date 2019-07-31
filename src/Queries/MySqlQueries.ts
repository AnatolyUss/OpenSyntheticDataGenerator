/*
 * This file is a part of "OpenSyntheticDataGenerator" - the synthetic data creation tool.
 *
 * Copyright (C) 2019 - present, Anatoly Khaytovich <anatolyuss@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program (please see the "LICENSE.md" file).
 * If not, see <http://www.gnu.org/licenses/gpl.txt>.
 *
 * @author Anatoly Khaytovich <anatolyuss@gmail.com>
 */
import { FsOps } from '../FsOps';
import { Connection } from '../Connection';
import { DBAccess } from './DBAccess';
import { DBAccessQueryResult } from './DBAccessQueryResult';

export class MySqlQueries extends DBAccess {
    /**
     * MySqlQueries constructor.
     */
    public constructor (connection: Connection) {
        super(connection);
    }

    /**
     * Assigns each table's configuration object with relational constraints info.
     */
    public async getTablesConstraints (tablesConfiguration: any): Promise<void> {
        const logTitle: string = 'MySqlQueries::_getTablesConstraints';

        const promises: Promise<void>[] = Object.keys(tablesConfiguration).map(async (tableName: string) => {
            const sql: string = `SHOW INDEX FROM ${ tableName }`;
            const showIndexResult: DBAccessQueryResult = await super.query(logTitle, sql, 'mysql', true, false);

            if (showIndexResult.error) {
                await FsOps.generateError(super.connection, showIndexResult.error);
                return;
            }

            console.log(showIndexResult.data);/////////////////////////////////
        });

        await Promise.all(promises);
    }
}
