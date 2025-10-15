import snowflake from 'snowflake-sdk';

export function getSnowflakeConnection() {
  return snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USERNAME!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
    database: process.env.SNOWFLAKE_DATABASE!,
    schema: process.env.SNOWFLAKE_SCHEMA!,
  });
}

export async function executeSnowflakeQuery(sqlText: string, binds: any[] = []): Promise<any[]> {
  const connection = getSnowflakeConnection();
  
  return new Promise((resolve, reject) => {
    connection.connect((err: any, conn: any) => {
      if (err) {
        console.error('❌ Snowflake connection error:', err);
        reject(err);
        return;
      }
      
      conn.execute({
        sqlText,
        binds,
        complete: (executeErr: any, stmt: any, rows: any[]) => {
          // Close connection properly
          try {
            conn.destroy((destroyErr: any) => {
              if (destroyErr) {
                console.error('Warning: Error closing connection:', destroyErr);
              }
            });
          } catch (e) {
            console.error('Warning: Could not close connection:', e);
          }
          
          if (executeErr) {
            console.error('❌ Snowflake query error:', executeErr);
            reject(executeErr);
          } else {
            resolve(rows || []);
          }
        },
      });
    });
  });
}
