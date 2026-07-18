import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });
    }
    return pool;
}

export async function query(text: string, params?: any[]) {
    try {
        const client = await getPool().connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

export async function getMembers() {
    const result = await query(`
        SELECT m.*, 
               COUNT(DISTINCT p.class_id) as class_count,
               STRING_AGG(DISTINCT c.class_name, ', ') as classes
        FROM members m
        LEFT JOIN placements p ON m.id = p.member_id AND p.status = 'Active'
        LEFT JOIN classes c ON p.class_id = c.id
        GROUP BY m.id
        ORDER BY m.last_name, m.first_name
    `);
    return result.rows;
}

export async function getClasses() {
    const result = await query(`
        SELECT c.*,
               COUNT(DISTINCT p.member_id) as current_enrollment
        FROM classes c
        LEFT JOIN placements p ON c.id = p.class_id AND p.status = 'Active'
        GROUP BY c.id
        ORDER BY c.age_group
    `);
    return result.rows;
}

export async function getPlacements() {
    const result = await query(`
        SELECT p.*,
               CONCAT(m.first_name, ' ', m.last_name) as member_name,
               c.class_name,
               m.date_of_birth,
               EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.date_of_birth)) as age
        FROM placements p
        JOIN members m ON p.member_id = m.id
        JOIN classes c ON p.class_id = c.id
        WHERE p.status = 'Active'
        ORDER BY p.placement_date DESC
    `);
    return result.rows;
}

export async function getMemberById(id: number) {
    const result = await query('SELECT * FROM members WHERE id = $1', [id]);
    return result.rows[0];
}

export async function getClassById(id: number) {
    const result = await query('SELECT * FROM classes WHERE id = $1', [id]);
    return result.rows[0];
}