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
import * as path from 'path';
import { DBVendor } from './Types/DBVendor';
import { Connection } from './Connection';
import { FsOps } from './FsOps';
import { DBAccess } from './Queries/DBAccess';
import { MySqlQueries } from './Queries/MySqlQueries';

export class Generator {
    private static _syntheticDataFilesPath: string;
    private static _tablesConfiguration: any;
    private static _connection: Connection;

    public static async generate () {
        const startTime: Date = new Date();
        const baseDir: string = path.join(__dirname, '..', '..');
        const configFileName: string = 'connection.json';
        const config: any = await FsOps.readFile(path.join(baseDir, 'config'), configFileName);
        Generator._connection = new Connection(config);
        Generator._syntheticDataFilesPath = path.join(Generator._connection.dbUploadsPath, 'synthetic_data_files');
        Generator._tablesConfiguration = await FsOps.readSyntheticDataConfiguration(baseDir, 'synthetic_data_configuration');
        await Generator._getTablesConstraints();

        // console.log(JSON.stringify(Generator._tablesConfiguration)); // TODO: remove asap.

        Generator._outputTimeTaken(startTime);
    }

    /**
     * Assigns each table's configuration object with relational constraints info.
     */
    private static async _getTablesConstraints (): Promise<void> {
        const dbAccess: DBAccess = <DBAccess> await Generator._getQueriesInstance();
        await dbAccess.getTablesConstraints(Generator._tablesConfiguration);
    }

    /**
     * Returns appropriate queries class's instance.
     */
    private static async _getQueriesInstance (): Promise<DBAccess | undefined> {
        const dbVendor: DBVendor = Generator._connection.dbVendor;

        switch (dbVendor) {
            case 'mysql':
                return new MySqlQueries(Generator._connection);
            default:
                const message: string = `Database vendor ${ dbVendor } currently unsupported.`;
                await FsOps.generateError(Generator._connection, message);
                process.exit(1);
        }
    }

    /**
     * Adds parent models names to the dependencies "sortedModelNames".
     */
    /*private _addParentModelNames (modelName: string, sortedModelNames: string[], includePrepopulated: boolean = false): void {
        const { fakerSchema } = this._models[modelName].model

        if (!fakerSchema && !includePrepopulated) {
            // Data for current model has been added during migration ("created_by_migration" = true).
            return
        }

        Object.keys(fakerSchema || Object.create(null))
            .filter(column => fakerSchema[column].foreign_key)
            .map(column => fakerSchema[column].foreign_key.model)
            .forEach(parentModelName => this._addParentModelNames(parentModelName, sortedModelNames, includePrepopulated))

        if (sortedModelNames.indexOf(modelName) === -1) {
            sortedModelNames.push(modelName)
        }
    }*/

    /**
     * Outputs time, taken for seeding process.
     */
    private static _outputTimeTaken (startTime: Date): void {
        const endTime: Date = new Date();
        let differenceSec: number = (endTime.getTime() - startTime.getTime()) / 1000;
        const seconds: number = Math.floor(differenceSec % 60);
        differenceSec = differenceSec / 60;
        const minutes: number = Math.floor(differenceSec % 60);
        const hours: number = Math.floor(differenceSec / 60);
        const formattedHours: string = hours < 10 ? `0${hours}` : `${hours}`;
        const formattedMinutes: string = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const formattedSeconds: string = seconds < 10 ? `0${seconds}` : `${seconds}`;
        const output: string = `Total time: ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        console.log(output);
        process.exit(0);
    }
}
