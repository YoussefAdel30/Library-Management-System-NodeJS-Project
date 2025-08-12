-- -- ==============================
-- -- DROP TABLES IF EXISTS (Safe re-run)
-- -- ==============================
-- DROP TABLE IF EXISTS borrowings CASCADE;
-- DROP TABLE IF EXISTS borrowers CASCADE;
-- DROP TABLE IF EXISTS books CASCADE;

-- ==============================
-- TABLE: books
-- ==============================
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    shelf_location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster search
CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author ON books (author);
CREATE INDEX idx_books_isbn ON books (isbn);

-- ==============================
-- TABLE: borrowers
-- ==============================
CREATE TABLE borrowers (
    borrower_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    registered_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for frequent lookup by email
CREATE INDEX idx_borrowers_email ON borrowers (email);

-- ==============================
-- TABLE: borrowings
-- ==============================
CREATE TABLE borrowings (
    borrowing_id SERIAL PRIMARY KEY,
    borrower_id INT NOT NULL REFERENCES borrowers(borrower_id) ON DELETE CASCADE,
    book_id INT NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    checkout_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    CONSTRAINT chk_due_date CHECK (due_date >= checkout_date),
    CONSTRAINT unique_active_borrow UNIQUE (borrower_id, book_id, return_date)
);

-- Indexes for frequent queries
CREATE INDEX idx_borrowings_due_date ON borrowings (due_date);
CREATE INDEX idx_borrowings_return_date ON borrowings (return_date);

-- ==============================
-- TRIGGER: Update updated_at on changes
-- ==============================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_books_update
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_borrowers_update
BEFORE UPDATE ON borrowers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();