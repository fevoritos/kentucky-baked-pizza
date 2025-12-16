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
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5)
);

CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO status (id, name) VALUES 
    (1, 'pending'),
    (2, 'processing'),
    (3, 'completed'),
    (4, 'cancelled')
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
    id SERIAL PRIMARY KEY,
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dish(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, dish_id)
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
    (1, 'Наслаждение', 300.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food1.png', 4.7),
    (2, 'Такос', 280.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food2.png', 4.8),
    (3, 'Аццки острая', 320.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food3.png', 4.9),
    (4, 'Жаркое с сыром', 290.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food4.png', 4.4),
    (5, 'Цезарь с курицей', 290.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food5.png', 4.8),
    (6, 'Зелёный салат', 290.00, 'https://cdn-bucket.hb.ru-msk.vkcs.cloud/purple-images/demo/food/food6.png', 4.5)
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
