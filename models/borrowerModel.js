const db = require('../config/db');

const Borrower = {
  // ---------------- Used Methods for Borrowers - Used in Controller --------------
  async findAll() {
    const { rows } = await db.query('SELECT * FROM borrowers ORDER BY borrower_id ASC');
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM borrowers WHERE borrower_id = $1', [id]);
    return rows[0];
  },

  async create({ name, email }) {
    const { rows } = await db.query(
      'INSERT INTO borrowers (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return rows[0];
  },

  async update(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${idx++}`);
    values.push(value);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  const q = `
    UPDATE borrowers
    SET ${setClauses.join(', ')}
    WHERE borrower_id = $${idx}
    RETURNING *;
  `;

  values.push(id);
  const { rows } = await db.query(q, values);
  return rows[0];
},

  async remove(id) {
    const { rows } = await db.query('DELETE FROM borrowers WHERE borrower_id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Borrower;
