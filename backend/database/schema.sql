CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO role (id, name) VALUES 
    (1, 'admin'),
    (2, 'customer')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    role INTEGER NOT NULL REFERENCES role(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS dish (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT NULL CHECK (rating >= 0 AND rating <= 5)
);

CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO status (id, name) VALUES 
    (1, 'обработка'),
    (2, 'принят'),
    (3, 'готовится'),
    (4, 'доставляется'),
    (5, 'доставлен'),
    (6, 'отклонён')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS ingredient (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS dish_ingredient (
    dish_id INTEGER NOT NULL REFERENCES dish(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,
    PRIMARY KEY (dish_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS "order" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status INTEGER NOT NULL REFERENCES status(id) ON DELETE RESTRICT,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 169.00,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_item (
    order_id INTEGER NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dish(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, dish_id)
);

CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_item (
    cart_id INTEGER NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dish(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (cart_id, dish_id)
);

CREATE TABLE IF NOT EXISTS feedback (
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dish(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, dish_id)
);


INSERT INTO ingredient (name) VALUES 
    ('салями'),
    ('руккола'),
    ('помидоры'),
    ('оливки'),
    ('острый перец'),
    ('лепёшка'),
    ('фарш'),
    ('острый соус'),
    ('грибы'),
    ('картофель'),
    ('сыр'),
    ('перец'),
    ('курица'),
    ('соус Цезарь'),
    ('огурец'),
    ('орехи')
ON CONFLICT (name) DO NOTHING;

INSERT INTO dish (id, name, price, image, rating) VALUES 
    (1, 'Наслаждение', 300.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food1.png', NULL),
    (2, 'Такос', 280.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food2.png', NULL),
    (3, 'Аццки острая', 320.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food3.png', NULL),
    (4, 'Жаркое с сыром', 290.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food4.png', NULL),
    (5, 'Цезарь с курицей', 290.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food5.png', NULL),
    (6, 'Зелёный салат', 290.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food6.png', NULL)
ON CONFLICT (id) DO NOTHING;

DELETE FROM dish_ingredient;

INSERT INTO dish_ingredient (dish_id, ingredient_id) VALUES
    (1, (SELECT id FROM ingredient WHERE name = 'салями')),
    (1, (SELECT id FROM ingredient WHERE name = 'руккола')),
    (1, (SELECT id FROM ingredient WHERE name = 'помидоры')),
    (1, (SELECT id FROM ingredient WHERE name = 'оливки')),
    
    (2, (SELECT id FROM ingredient WHERE name = 'острый перец')),
    (2, (SELECT id FROM ingredient WHERE name = 'лепёшка')),
    (2, (SELECT id FROM ingredient WHERE name = 'фарш')),
    
    (3, (SELECT id FROM ingredient WHERE name = 'острый соус')),
    (3, (SELECT id FROM ingredient WHERE name = 'грибы')),
    (3, (SELECT id FROM ingredient WHERE name = 'помидоры')),
    (3, (SELECT id FROM ingredient WHERE name = 'оливки')),
    
    (4, (SELECT id FROM ingredient WHERE name = 'картофель')),
    (4, (SELECT id FROM ingredient WHERE name = 'сыр')),
    (4, (SELECT id FROM ingredient WHERE name = 'перец')),
    (4, (SELECT id FROM ingredient WHERE name = 'фарш')),
    
    (5, (SELECT id FROM ingredient WHERE name = 'курица')),
    (5, (SELECT id FROM ingredient WHERE name = 'сыр')),
    (5, (SELECT id FROM ingredient WHERE name = 'соус Цезарь')),
    (5, (SELECT id FROM ingredient WHERE name = 'помидоры')),
    
    (6, (SELECT id FROM ingredient WHERE name = 'огурец')),
    (6, (SELECT id FROM ingredient WHERE name = 'орехи')),
    (6, (SELECT id FROM ingredient WHERE name = 'перец'));

INSERT INTO "user" (id, email, password_hash, name, address, phone, role) VALUES
    (1, 'a@gmail.com', '$2b$10$GAa5lRxlldl0bfQEbdLhvenGwu9SNllc5Fxn16kPL4/F0EzjgiSAO', 'Иван Иванов', 'Москва, ул. Пушкина, 1', '+79001112233', 1),
    (2, 'customer2@example.com', 'hash2', 'Петр Петров', 'СПб, ул. Ленина, 10', '+79004445566', 2),
    (3, 'customer3@example.com', 'hash3', 'Мария Сидорова', 'Екатеринбург, ул. Мира, 5', '+79007778899', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "order" (id, user_id, status, delivery_fee, address, phone) VALUES
    (1, 1, 5, 169.00, 'Москва, ул. Пушкина, 1', '+79001112233'),
    (2, 2, 5, 169.00, 'СПб, ул. Ленина, 10', '+79004445566'),
    (3, 3, 5, 169.00, 'Екатеринбург, ул. Мира, 5', '+79007778899')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_item (order_id, dish_id, quantity, price)
SELECT o.id, d.id, 1, d.price
FROM "order" o
CROSS JOIN dish d
WHERE o.id <= 3
ON CONFLICT (order_id, dish_id) DO NOTHING;

INSERT INTO feedback (user_id, dish_id, value) VALUES
    (1, 1, 5), (1, 2, 5), (1, 3, 5), (1, 4, 4), (1, 5, 4), (1, 6, 5),
    (2, 1, 4), (2, 2, 5), (2, 3, 5), (2, 4, 5), (2, 5, 5), (2, 6, 5),
    (3, 1, 5), (3, 2, 5), (3, 3, 5), (3, 4, 4), (3, 5, 4), (3, 6, 3)
ON CONFLICT (user_id, dish_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('role', 'id'), (SELECT MAX(id) FROM role));
SELECT setval(pg_get_serial_sequence('user', 'id'), (SELECT MAX(id) FROM "user"));
SELECT setval(pg_get_serial_sequence('dish', 'id'), (SELECT MAX(id) FROM dish));
SELECT setval(pg_get_serial_sequence('status', 'id'), (SELECT MAX(id) FROM status));
SELECT setval(pg_get_serial_sequence('order', 'id'), (SELECT MAX(id) FROM "order"));

UPDATE dish d
SET rating = (
    SELECT ROUND(AVG(f.value), 2)
    FROM feedback f
    WHERE f.dish_id = d.id
);
