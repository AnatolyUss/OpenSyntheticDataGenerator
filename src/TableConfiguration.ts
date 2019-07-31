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
import { ParentTableRatio } from './ParentTableRatio';
import { DBAccess } from './Queries/DBAccess';
import { Helper } from './Helper';

export class TableConfiguration {
    /**
     * The flag, indicating if current table has already been populated.
     */
    public isPopulated: boolean;

    /**
     * The array of records to insert into target database.
     */
    public data: any[];

    /**
     * The order of columns in given table.
     */
    public columnsOrder: string[];

    /**
     * The final amount of records to insert into given table.
     */
    public amount: number;

    /**
     * The records ratio between current table and its "parent" table.
     */
    public parentTableRatio: ParentTableRatio | null;

    /**
     * The flag, indicating if current table has been populated during "migrations" process.
     */
    public isPopulatedByMigration: boolean;

    /**
     * Current table's unique indexes array.
     */
    public uniqueIndexes?: string[][];

    /**
     * A dictionary, where keys are columns names, and values are corresponding faker parameters.
     */
    public fakerSchema: any;

    /**
     * Class constructor.
     */
    public constructor (fakerSchema: any, parentTableRatio: ParentTableRatio | null = null, amount: number | null = null) {
        this.isPopulated = false;
        this.data = [];
        this.columnsOrder = [];
        this.fakerSchema = fakerSchema;
        this.parentTableRatio = parentTableRatio;

        if (this.parentTableRatio) {
            //
        }
    }

    /**
     * Assigns each table's configuration object with relational constraints info.
     */
    public static async getTablesConstraints (dbAccess: DBAccess, tablesConfiguration: any): Promise<void> {
        await dbAccess.getTablesConstraints(tablesConfiguration);
    }

    /**
     * Returns a list of faker schema properties, where properties without "null_if_no" condition returned first.
     */
    public static getSortedColumns (fakerSchema: any): string[] {
        const compare = (col1: string, _col2: string) => {
            return +(Array.isArray(fakerSchema[col1].null_if_no) && fakerSchema[col1].null_if_no.length !== 0);
        };

        return Object.keys(fakerSchema).sort(compare);
    }
}
