-- Create the user table
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    contactNumber VARCHAR(20),
    email VARCHAR(50) UNIQUE,
    password VARCHAR(250),
    status BOOLEAN DEFAULT FALSE, -- Use BOOLEAN if it’s a true/false value
    role VARCHAR(20)
);

-- Insert a user (make sure to hash the password in real applications)
INSERT INTO user (name, contactNumber, email, password, status, role)
VALUES ('admin', '0731062846', 'hodamadadi5@gmail.com', '12345678', TRUE, 'admin');

create table category(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    primary key(id)
);

CREATE TABLE product (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    categoryId INT NOT NULL,
    description VARCHAR(255),
    price INT,
    status VARCHAR(20),
    PRIMARY KEY (id)
);

CREATE TABLE bill (
    id INT NOT NULL AUTO_INCREMENT,
    uuid CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(20) NOT NULL,
    paymentMethod VARCHAR(55) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    productDetails JSON DEFAULT NULL,
    createdBy VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);