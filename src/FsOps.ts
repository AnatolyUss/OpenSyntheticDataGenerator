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
import ErrnoException = NodeJS.ErrnoException;

export class FsOps {
    /**
     * Reads the configuration file.
     */
    static readConfig(baseDir: string, configFileName: string): Promise<any> {
        return new Promise<any>(resolve => {
            const strPathToConfig = path.join(baseDir, 'config', configFileName);

            fs.readFile(strPathToConfig, (error: ErrnoException | null, data: Buffer) => {
                if (error) {
                    console.log(`\n\t--Cannot read configuration from  ${ strPathToConfig }`);
                    process.exit();
                }

                try {
                    resolve(JSON.parse(data.toString()));
                } catch (error) {
                    console.log('\n\t--Configuration file is not in json format.');
                    process.exit();
                }
            });
        });
    }
}
