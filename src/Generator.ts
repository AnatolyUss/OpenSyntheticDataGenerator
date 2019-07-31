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
import { Connection } from './Connection';
import { FsOps } from './FsOps';

export class Generator {
    static async generate () {
        const startTime: Date = new Date();
        const baseDir: string = path.join(__dirname, '..', '..');
        const configFileName: string = 'connection.json';
        const config: any = await FsOps.readConfig(baseDir, configFileName);
        const connection: Connection = new Connection(config);
        const syntheticDataFilesPath: string = path.join(connection.dbUploadsPath, 'synthetic_data_files');

        Generator.outputTimeTaken(startTime);
    }

    /**
     * Outputs time, taken for seeding process.
     */
    static outputTimeTaken (startTime: Date): void {
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
    }
}
