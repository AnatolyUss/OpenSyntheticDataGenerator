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
export class Connection {
    /**
     * Current database vendor.
     */
   public dbVendor: string;

    /**
     * Connection parameters to current database.
     */
   public connection: any;

    /**
     * Directory, from which data files will be imported into current database.
     */
   public dbUploadsPath: string;

    /**
     * Maximal amount of simultaneous connections to current database server.
     */
   public connectionPoolSize: number;

    /**
     * Valid JavaScript encoding type.
     */
   public encoding: string;

    /**
     * A name of the schema, that contains all tables.
     * !!!Note, schema parameter is relevant only for database servers that use schemas, for example: PostgreSQL.
     */
   public schema: string;

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
   }
}
