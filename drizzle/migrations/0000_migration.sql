insert into public.plans (name, price, billing_period, features, cta, popular, active, sort_order) values
('Instagram Monthly Plan', 20, 'month', ARRAY['Instagram insight editor'], 'Get Plan', false, true, 1),
('Instagram Lifetime Pro Plan', 40, 'once', ARRAY['Instagram insight editor','Lifetime updates at no extra cost'], 'Get Plan', true, true, 2),
('TikTok Monthly Plan', 20, 'month', ARRAY['TikTok insight editor'], 'Get Plan', false, true, 3),
('TikTok Lifetime Pro Plan', 40, 'once', ARRAY['TikTok insight editor','Lifetime updates at no extra cost'], 'Get Plan', true, true, 4);