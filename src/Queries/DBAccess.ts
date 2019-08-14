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
import * as mysql from 'mysql';
import { Pool as MySQLPool, MysqlError, PoolConnection } from 'mysql';
import { Pool as PgPool, PoolClient } from 'pg';
import { FsOps } from '../FsOps';
import { Connection } from '../Connection';
import { DBVendor } from '../Types/DBVendor';
import { DBAccessQueryResult } from './DBAccessQueryResult';
import { ConnectionPool } from '../Types/ConnectionPool';
import { ConnectionPoolClient } from '../Types/ConnectionPoolClient';

export abstract class DBAccess {
    /**
     * Conversion instance.
     */
    protected readonly connection: Connection;

    /**
     * DBAccess constructor.
     */
    protected constructor (connection: Connection) {
        this.connection = connection;
    }

    /**
     * Assigns each table's configuration object with relational constraints info.
     */
    abstract getTablesConstraints (tablesConfiguration: any): Promise<void>;

    /**
     * Sends given SQL query to specified DB.
     * Performs appropriate actions (requesting/releasing client) against target connections pool.
     */
    public async query (
        caller: string,
        sql: string,
        dbVendor: DBVendor,
        processExitOnError: boolean,
        shouldReturnClient: boolean,
        client?: ConnectionPoolClient,
        bindings?: any[]
    ): Promise<DBAccessQueryResult> {
        // Checks if there is an available client.
        if (!client) {
            try {
                // Client is undefined.
                // It must be requested from the connections pool.
                client = await this._getDbClient(dbVendor);
            } catch (error) {
                // An error occurred when tried to obtain the pool client.
                await FsOps.generateError(this.connection, `\t--[${ caller }] ${ error }\n${ sql }`);
                return processExitOnError ? process.exit(1) : { client: client, data: undefined, error: error };
            }
        }

        switch (dbVendor) {
            case 'pg':
                return this._queryPG(caller, sql, processExitOnError, shouldReturnClient, (<PoolClient>client), bindings);
            case 'mysql':
                return this._queryMySQL(caller, sql, processExitOnError, shouldReturnClient, (<PoolConnection>client), bindings);
            default:
                return { client: client, data: undefined, error: `Database vendor ${dbVendor} currently unsupported.` };
        }
    }

    /**
     * Sends given SQL query to MySQL server.
     */
    private _queryMySQL (
        caller: string,
        sql: string,
        processExitOnError: boolean,
        shouldReturnClient: boolean,
        client?: PoolConnection,
        bindings?: any[]
    ): Promise<DBAccessQueryResult> {
        return new Promise<DBAccessQueryResult>((resolve, reject) => {
            if (Array.isArray(bindings)) {
                sql = (<PoolConnection>client).format(sql, bindings);
            }

            (<PoolConnection>client).query(sql, async (error: MysqlError | null, data: any) => {
                await this._releaseDbClientIfNecessary((<PoolConnection>client), shouldReturnClient);

                if (error) {
                    await FsOps.generateError(this.connection, `\t--[${ caller }] ${ error }\n${ sql }`);
                    return processExitOnError ? process.exit(1) : reject({ client: client, data: undefined, error: error });
                }

                return resolve({ client: client, data: data, error: undefined });
            });
        });
    }

    /**
     * Sends given SQL query to PostgreSQL server.
     */
    private async _queryPG (
        caller: string,
        sql: string,
        processExitOnError: boolean,
        shouldReturnClient: boolean,
        client?: PoolClient,
        bindings?: any[]
    ): Promise<DBAccessQueryResult> {
        try {
            const data: any = Array.isArray(bindings) ? await (<PoolClient>client).query(sql, bindings) : await (<PoolClient>client).query(sql);
            await this._releaseDbClientIfNecessary((<PoolClient>client), shouldReturnClient); // Sets the client undefined.
            return { client: client, data: data, error: undefined };
        } catch (error) {
            await this._releaseDbClientIfNecessary((<PoolClient>client), shouldReturnClient); // Sets the client undefined.
            await FsOps.generateError(this.connection, `\t--[${ caller }] ${ error }\n${ sql }`);
            return processExitOnError ? process.exit(1) : { client: client, data: undefined, error: error };
        }
    }

    /**
     * Obtains an appropriate database client.
     */
    private _getDbClient (dbVendor: DBVendor): Promise<ConnectionPoolClient> {
        switch (dbVendor) {
            case 'pg':
                return this.getPgClient();
            case 'mysql':
                return this.getMysqlClient();
            default:
                throw new Error(`Database vendor ${ dbVendor } currently unsupported.`);
        }
    }

    /**
     * Ensures MySQL connection pool existence.
     */
    private async _getMysqlConnectionPool (): Promise<void> {
        if (!this.connection.connectionPool) {
            this.connection.connection.connectionLimit = this.connection.connectionPoolSize;
            this.connection.connection.multipleStatements = true;
            const pool: ConnectionPool = mysql.createPool(this.connection.connection);

            if (!pool) {
                await FsOps.generateError(this.connection, '\t--[getMysqlConnection] Cannot connect to MySQL server...');
                process.exit(1);
            }

            this.connection.connectionPool = pool;
        }
    }

    /**
     * Ensures PostgreSQL connection pool existence.
     */
    private async _getPgConnectionPool (): Promise<void> {
        if (!this.connection.connectionPool) {
            this.connection.connection.max = this.connection.connectionPoolSize;
            const pool: ConnectionPool = new PgPool(this.connection.connection);

            if (!pool) {
                await FsOps.generateError(this.connection, '\t--[getPgConnection] Cannot connect to PostgreSQL server...');
                process.exit(1);
            }

            this.connection.connectionPool = pool;

            (<PgPool>this.connection.connectionPool).on('error', async (error: Error) => {
                const message: string = `Cannot connect to PostgreSQL server...\n' ${ error.message }\n${ error.stack }`;
                await FsOps.generateError(this.connection, message);
            });
        }
    }

    /**
     * Obtains PoolConnection instance.
     */
    public getMysqlClient (): Promise<ConnectionPoolClient> {
        return new Promise<ConnectionPoolClient>(async (resolve, reject) => {
            await this._getMysqlConnectionPool();
            (<MySQLPool>this.connection.connectionPool).getConnection((err: MysqlError | null, connection: PoolConnection) => {
                return err ? reject(err) : resolve(connection);
            });
        });
    }

    /**
     * Obtains PoolClient instance.
     */
    public async getPgClient (): Promise<ConnectionPoolClient> {
        await this._getPgConnectionPool();
        return (<PgPool>this.connection.connection).connect();
    }

    /**
     * Releases given client back to appropriate pool.
     */
    public async releaseDbClient (dbClient?: ConnectionPoolClient): Promise<void> {
        try {
            (<ConnectionPoolClient>dbClient).release();
            dbClient = undefined;
        } catch (error) {
            await FsOps.generateError(this.connection, `\t--[DBAccess::releaseDbClient] ${ error }`);
        }
    }

    /**
     * Checks if there are no more queries to be sent using current client.
     * In such case the client should be released.
     */
    private async _releaseDbClientIfNecessary (client: ConnectionPoolClient, shouldHoldClient: boolean): Promise<void> {
        if (!shouldHoldClient) {
            await this.releaseDbClient(client);
        }
    }
}
