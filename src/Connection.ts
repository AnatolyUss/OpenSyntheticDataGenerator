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
import { Encoding } from './Types/Encoding';
import { ConnectionPool } from './Types/ConnectionPool';
import { DBVendor } from './Types/DBVendor';

export class Connection {
    /**
     * Current database vendor.
     */
   public readonly dbVendor: DBVendor;

    /**
     * Connection parameters to current database.
     */
   public readonly connection: any;

    /**
     * Directory, from which data files will be imported into current database.
     */
   public readonly dbUploadsPath: string;

    /**
     * Maximal amount of simultaneous connections to current database server.
     */
   public readonly connectionPoolSize: number;

    /**
     * Valid JavaScript encoding type.
     */
   public readonly encoding: Encoding;

    /**
     * A name of the schema, that contains all tables.
     * !!!Note, schema parameter is relevant only for database servers that use schemas, for example: PostgreSQL.
     */
   public readonly schema: string;

    /**
     * The path to the logs directory.
     */
   public readonly logsDirectoryPath: string;

    /**
     * The path to the "logs.txt" file.
     */
   public readonly logsFilePath: string;

    /**
     * The path to the "errors.txt" file.
     */
   public readonly errorLogsFilePath: string;

    /**
     * Connection pool instance.
     */
   public connectionPool?: ConnectionPool;

    /**
     * Class constructor.
     */
   public constructor (connectionConfiguration: any) {
       this.dbVendor = connectionConfiguration.db_vendor;
       this.connection = connectionConfiguration.connection;
       this.dbUploadsPath = connectionConfiguration.db_uploads_path;
       this.connectionPoolSize = connectionConfiguration.connection_pool_size || 10;
       this.encoding = connectionConfiguration.encoding || 'utf8';
       this.schema = connectionConfiguration.schema || 'public';
       this.logsDirectoryPath = path.join(__dirname, '..', 'logs_directory');
       this.logsFilePath = path.join(this.logsDirectoryPath, 'logs.txt');
       this.errorLogsFilePath = path.join(this.logsDirectoryPath, 'errors.txt');
   }
}
