-- Insert into books
INSERT INTO books (title, author, isbn, available_quantity, shelf_location) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 5, 'A1'),
('1984', 'George Orwell', '9780451524935', 8, 'A2'),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 6, 'B1'),
('Pride and Prejudice', 'Jane Austen', '9781503290563', 7, 'B2'),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 4, 'C1'),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 9, 'C2'),
('Moby-Dick', 'Herman Melville', '9780142437247', 3, 'D1'),
('War and Peace', 'Leo Tolstoy', '9780199232765', 2, 'D2'),
('The Odyssey', 'Homer', '9780140268867', 5, 'E1'),
('Crime and Punishment', 'Fyodor Dostoevsky', '9780143058144', 6, 'E2');

-- Insert into borrowers
INSERT INTO borrowers (name, email, registered_date) VALUES
('Alice Johnson', 'alice.johnson@example.com', '2024-01-10'),
('Bob Smith', 'bob.smith@example.com', '2024-02-12'),
('Charlie Davis', 'charlie.davis@example.com', '2024-03-15'),
('Diana Moore', 'diana.moore@example.com', '2024-04-20'),
('Edward King', 'edward.king@example.com', '2024-05-22'),
('Fiona Clark', 'fiona.clark@example.com', '2024-06-25'),
('George Lee', 'george.lee@example.com', '2024-07-30'),
('Hannah Scott', 'hannah.scott@example.com', '2024-08-05'),
('Ian Wright', 'ian.wright@example.com', '2024-09-10'),
('Julia Green', 'julia.green@example.com', '2024-10-15');

-- Insert into borrowings (some returned, some active, some overdue)
INSERT INTO borrowings (borrower_id, book_id, checkout_date, due_date, return_date) VALUES
(1, 1, '2025-07-01', '2025-07-15', '2025-07-14'),
(2, 2, '2025-07-01', '2025-07-15', '2025-07-20'),
(3, 3, '2025-07-25', '2025-08-05', '2025-08-11'),
(4, 4, '2025-08-01', '2025-08-10', NULL),
(5, 5, '2025-08-11', '2025-08-21', NULL),
(6, 6, '2025-07-15', '2025-07-30', '2025-07-29'),
(7, 7, '2025-08-05', '2025-08-15', NULL),
(8, 8, '2025-07-20', '2025-08-01', '2025-08-02'),
(9, 9, '2025-07-18', '2025-08-02', '2025-08-01'),
(10, 10, '2025-08-12', '2025-08-14', NULL);
