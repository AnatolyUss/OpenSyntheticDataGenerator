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
import * as fs from 'fs';
import { Connection } from './Connection';
import ErrnoException = NodeJS.ErrnoException;

export class FsOps {
    /**
     * Reads the configuration file.
     */
    public static readFile (baseDir: string, fileName: string): Promise<any> {
        return new Promise<any>(resolve => {
            const pathToConfig: string = path.join(baseDir, fileName);

            fs.readFile(pathToConfig, (error: ErrnoException | null, data: Buffer) => {
                if (error) {
                    console.log(`\n\t--Cannot read configuration from  ${ pathToConfig }`);
                    process.exit(1);
                }

                try {
                    resolve(JSON.parse(data.toString()));
                } catch (error) {
                    console.log('\n\t--Configuration file is not in json format.');
                    process.exit(1);
                }
            });
        });
    }

    /**
     * Reads synthetic data configuration.
     */
    public static readSyntheticDataConfiguration (baseDir: string, confDir: string): Promise<any> {
        return new Promise<any>(resolve => {
            const pathToSyntheticDataConfiguration: string = path.join(baseDir, 'config', confDir);

            fs.readdir(pathToSyntheticDataConfiguration, async (error, files) => {
                if (error) {
                    console.log(`\n\t--Cannot read configuration from  ${ pathToSyntheticDataConfiguration }`);
                    process.exit(1);
                }

                const syntheticDataConfiguration: any = Object.create(null);

                const promises: Promise<any>[] = files.map(async (fullTableName: string) => {
                    const tableName: string = <string> fullTableName.split('.').shift();
                    syntheticDataConfiguration[tableName] = await FsOps.readFile(pathToSyntheticDataConfiguration, fullTableName);
                });

                await Promise.all(promises);
                resolve(syntheticDataConfiguration);
            });
        });
    }

    /**
     * Outputs given log.
     * Writes given log to the "/logs.txt" file.
     */
    public static log (connection: Connection, log: string | ErrnoException): Promise<void> {
        console.log(log);
        return FsOps._writeLog(connection, `${ log }\n\n`);
    }

    /**
     * Writes a detailed error message to the "/errors.txt" file.
     */
    public static generateError (connection: Connection, message: string): Promise<void> {
        return FsOps._writeLog(connection, `${ message }\n\n`, true);
    }

    /**
     * Writes given log to appropriate file.
     */
    private static _writeLog (connection: Connection, message: string, isError: boolean = false): Promise<void> {
        const buffer: Buffer = Buffer.from(message, connection.encoding);
        const filePath: string = isError ? connection.errorLogsFilePath : connection.logsFilePath;

        return new Promise<void>(resolve => {
            fs.open(filePath, 'a', '0777', (error: ErrnoException | null, fd: number) => {
                if (!error) {
                    fs.write(fd, buffer, 0, buffer.length, null, () => {
                        fs.close(fd, () => resolve());
                    });
                }
            });
        });
    }
}
