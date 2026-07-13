-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ========================================
-- Project Table
-- ========================================
-- Each project is sponsored by exactly one organization. The REFERENCES clause
-- makes the database itself enforce that: a project row cannot exist with an
-- organization_id that does not appear in the organization table.
--
-- ON DELETE CASCADE means deleting an organization also removes its projects,
-- so we never end up with projects pointing at a sponsor that no longer exists.
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL REFERENCES organization (organization_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    project_date DATE NOT NULL
);

-- ========================================
-- Insert sample data: Projects
-- ========================================
-- organization_id is looked up by name instead of being hardcoded to 1, 2, 3.
-- The SERIAL values depend on insert order, so a subquery keeps the sample data
-- correct even if the organization rows are ever re-inserted in a different order.
INSERT INTO project (organization_id, title, description, location, project_date)
VALUES
-- BrightFuture Builders
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'), 'Riverside Park Playground Build', 'Construct a new accessible playground for families in the Riverside neighborhood.', 'Riverside Park, Rexburg, ID', '2026-08-15'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'), 'Senior Center Ramp Installation', 'Build wheelchair ramps at the community senior center to improve accessibility.', 'Madison Senior Center, Rexburg, ID', '2026-08-29'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'), 'Habitat Home Framing Day', 'Frame the walls and roof for a family home in partnership with local builders.', '412 W Main St, Sugar City, ID', '2026-09-12'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'), 'Library Roof Repair', 'Repair storm damage to the roof of the public library annex.', 'Rexburg Public Library, Rexburg, ID', '2026-09-26'),
((SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'), 'Winter Shelter Weatherproofing', 'Insulate and weatherproof the emergency winter shelter before the first freeze.', 'Hope Shelter, Idaho Falls, ID', '2026-10-17'),

-- GreenHarvest Growers
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'), 'Community Garden Planting', 'Prepare beds and plant fall vegetables in the downtown community garden.', 'Center Street Garden, Rexburg, ID', '2026-08-22'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'), 'School Greenhouse Setup', 'Assemble a greenhouse so elementary students can grow produce year round.', 'Lincoln Elementary School, Rexburg, ID', '2026-09-05'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'), 'Fall Harvest Festival', 'Harvest the community garden and distribute produce to local families.', 'Center Street Garden, Rexburg, ID', '2026-10-03'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'), 'Composting Workshop', 'Teach neighborhood residents how to build and maintain a compost bin.', 'Porter Park Pavilion, Rexburg, ID', '2026-10-10'),
((SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'), 'Orchard Tree Pruning', 'Prune and mulch fruit trees in the shared community orchard.', 'Teton Community Orchard, Teton, ID', '2026-11-07'),

-- UnityServe Volunteers
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'), 'Thanksgiving Food Drive', 'Collect, sort, and box holiday meals for families served by the local food bank.', 'Community Food Basket, Idaho Falls, ID', '2026-11-14'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'), 'After-School Tutoring Launch', 'Tutor middle school students in math and reading twice a week.', 'Madison Middle School, Rexburg, ID', '2026-09-08'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'), 'Neighborhood Cleanup Day', 'Pick up litter and clear overgrown lots along the Main Street corridor.', 'Main Street Corridor, Rexburg, ID', '2026-09-19'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'), 'Animal Shelter Support Day', 'Walk dogs, clean kennels, and help with adoption events at the county shelter.', 'Madison County Animal Shelter, Rexburg, ID', '2026-10-24'),
((SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'), 'Holiday Gift Wrapping', 'Wrap and deliver donated gifts for children in local foster care.', 'Rexburg Community Center, Rexburg, ID', '2026-12-05');

-- ========================================
-- Category Table
-- ========================================
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- ========================================
-- Project/Category Join Table
-- ========================================
-- A project can fall under several categories, and a category covers many
-- projects, so this is a many-to-many relationship. It cannot be modeled with a
-- foreign key on either table alone: putting category_id on project would cap
-- each project at one category. Instead this join table holds one row per
-- project/category pairing.
--
-- The composite primary key (project_id, category_id) means the same pairing
-- cannot be inserted twice, and each column is also a foreign key so a pairing
-- can never reference a project or category that does not exist.
CREATE TABLE project_category (
    project_id INT NOT NULL REFERENCES project (project_id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES category (category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- ========================================
-- Insert sample data: Categories
-- ========================================
INSERT INTO category (name, description)
VALUES
('Environmental', 'Projects that protect, restore, or care for the natural world around us.'),
('Educational', 'Projects that teach skills and support students and lifelong learners.'),
('Community Service', 'Projects that meet immediate needs for neighbors and local families.'),
('Health and Wellness', 'Projects that support physical health, nutrition, and accessibility.'),
('Construction and Housing', 'Hands-on building and repair projects that improve shared spaces and homes.');

-- ========================================
-- Insert sample data: Project/Category pairings
-- ========================================
-- Rows are matched by title and name rather than hardcoded ids, for the same
-- reason as the project inserts above.
INSERT INTO project_category (project_id, category_id)
VALUES
((SELECT project_id FROM project WHERE title = 'Riverside Park Playground Build'), (SELECT category_id FROM category WHERE name = 'Construction and Housing')),
((SELECT project_id FROM project WHERE title = 'Riverside Park Playground Build'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'Senior Center Ramp Installation'), (SELECT category_id FROM category WHERE name = 'Construction and Housing')),
((SELECT project_id FROM project WHERE title = 'Senior Center Ramp Installation'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'Habitat Home Framing Day'), (SELECT category_id FROM category WHERE name = 'Construction and Housing')),
((SELECT project_id FROM project WHERE title = 'Habitat Home Framing Day'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'Library Roof Repair'), (SELECT category_id FROM category WHERE name = 'Construction and Housing')),
((SELECT project_id FROM project WHERE title = 'Library Roof Repair'), (SELECT category_id FROM category WHERE name = 'Educational')),
((SELECT project_id FROM project WHERE title = 'Winter Shelter Weatherproofing'), (SELECT category_id FROM category WHERE name = 'Construction and Housing')),
((SELECT project_id FROM project WHERE title = 'Winter Shelter Weatherproofing'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'Community Garden Planting'), (SELECT category_id FROM category WHERE name = 'Environmental')),
((SELECT project_id FROM project WHERE title = 'Community Garden Planting'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'School Greenhouse Setup'), (SELECT category_id FROM category WHERE name = 'Environmental')),
((SELECT project_id FROM project WHERE title = 'School Greenhouse Setup'), (SELECT category_id FROM category WHERE name = 'Educational')),
((SELECT project_id FROM project WHERE title = 'Fall Harvest Festival'), (SELECT category_id FROM category WHERE name = 'Environmental')),
((SELECT project_id FROM project WHERE title = 'Fall Harvest Festival'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'Composting Workshop'), (SELECT category_id FROM category WHERE name = 'Environmental')),
((SELECT project_id FROM project WHERE title = 'Composting Workshop'), (SELECT category_id FROM category WHERE name = 'Educational')),
((SELECT project_id FROM project WHERE title = 'Orchard Tree Pruning'), (SELECT category_id FROM category WHERE name = 'Environmental')),
((SELECT project_id FROM project WHERE title = 'Thanksgiving Food Drive'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'Thanksgiving Food Drive'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'After-School Tutoring Launch'), (SELECT category_id FROM category WHERE name = 'Educational')),
((SELECT project_id FROM project WHERE title = 'Neighborhood Cleanup Day'), (SELECT category_id FROM category WHERE name = 'Environmental')),
((SELECT project_id FROM project WHERE title = 'Neighborhood Cleanup Day'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'Animal Shelter Support Day'), (SELECT category_id FROM category WHERE name = 'Community Service')),
((SELECT project_id FROM project WHERE title = 'Holiday Gift Wrapping'), (SELECT category_id FROM category WHERE name = 'Community Service'));
