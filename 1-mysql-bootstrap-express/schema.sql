-- Optional: db.js already runs this automatically on start.
-- Run it by hand in MySQL Workbench / mysql CLI if you want to see the tables yourself.

CREATE DATABASE IF NOT EXISTS mini_store;
USE mini_store;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(200) NOT NULL
);

INSERT INTO products (name, price, image) VALUES
('Headphones', 2000, 'https://placehold.co/300x200?text=Headphones'),
('Bracelet',    600, 'https://placehold.co/300x200?text=Bracelet'),
('Shoes',      3000, 'https://placehold.co/300x200?text=Shoes'),
('Socks',       400, 'https://placehold.co/300x200?text=Socks');

SELECT * FROM products;
