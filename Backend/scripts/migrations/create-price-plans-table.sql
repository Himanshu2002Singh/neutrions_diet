-- Create price_plans table
CREATE TABLE IF NOT EXISTS price_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price VARCHAR(100) NOT NULL,
  image VARCHAR(500) DEFAULT NULL,
  badge VARCHAR(100) DEFAULT NULL,
  offer VARCHAR(255) DEFAULT NULL,
  color VARCHAR(100) NOT NULL DEFAULT 'bg-[#C5E17A]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default price plans
INSERT INTO price_plans (name, description, price, image, badge, offer, color, sort_order) VALUES
('Personalized Meal Plan', 'AI-curated meals based on your medical conditions, body type, and dietary preferences', 'From $99/month', '/images/meal_planer.jpg', 'AI Powered', NULL, 'bg-[#C5E17A]', 1),
('Progress Tracking', 'Detailed weight, nutrition, and fitness milestone tracking with visual charts', 'Free with plan', '/images/progressImage.png', 'Popular', NULL, 'bg-[#FFC878]', 2),
('1-on-1 Dietitian Support', 'Personal dietitian coach with weekly check-ins and customized recommendations', 'Add-on $49/month', '/images/1on1.jpg', 'Premium', NULL, 'bg-[#CE93D8]', 3),
('Complete Health Package', 'Full access to all features including AI coaching, dietitian support, and meal planning', '$149/month', '/images/meal_planer.jpg', 'Best Value', '20% OFF First Month', 'bg-[#4FC3F7]', 4),
('Weekend Detox Plan', 'Specialized weekend detox and reset program with meal plans', '$29/weekend', '/images/progressImage.png', 'Limited', NULL, 'bg-[#FF8A65]', 5);

