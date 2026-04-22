-- 补齐商品品种/产地/发芽率，并将销量目标写入 order_items（通过增量行实现）
START TRANSACTION;

UPDATE products p
JOIN (
  SELECT 1 AS id, '圣女果' AS variety, '山东寿光' AS origin_place, 93.00 AS germination_rate UNION ALL
  SELECT 2, '早青黄瓜', '河南周口', 91.00 UNION ALL
  SELECT 3, '奶油生菜', '河北廊坊', 95.00 UNION ALL
  SELECT 4, '甜椒', '广西南宁', 90.00 UNION ALL
  SELECT 5, '甜罗勒', '云南昆明', 92.00 UNION ALL
  SELECT 6, '留兰香薄荷', '四川成都', 89.00 UNION ALL
  SELECT 7, '观赏向日葵', '内蒙古赤峰', 88.00 UNION ALL
  SELECT 8, '法国薰衣草', '云南大理', 86.00 UNION ALL
  SELECT 9, '四季草莓', '辽宁丹东', 87.00 UNION ALL
  SELECT 10, '标准喷壶', '浙江台州', 100.00 UNION ALL
  SELECT 11, '缓释复合肥', '山东临沂', 100.00 UNION ALL
  SELECT 12, '景天多肉混合', '云南昆明', 85.00
) v ON v.id = p.id
SET p.variety = v.variety,
    p.origin_place = v.origin_place,
    p.germination_rate = v.germination_rate;

-- 清理旧的“合成销量”记录，保证脚本可重复执行
DELETE FROM order_items WHERE order_id BETWEEN 900001 AND 900999;

INSERT INTO order_items (order_id, product_id, product_name_snapshot, price_snapshot, quantity, line_total)
SELECT
  900000 + p.id AS order_id,
  p.id AS product_id,
  p.name AS product_name_snapshot,
  p.price AS price_snapshot,
  GREATEST(t.target_sales - COALESCE(s.real_sales, 0), 0) AS quantity,
  ROUND(p.price * GREATEST(t.target_sales - COALESCE(s.real_sales, 0), 0), 2) AS line_total
FROM products p
JOIN (
  SELECT 1 AS product_id, 328 AS target_sales UNION ALL
  SELECT 2, 276 UNION ALL
  SELECT 3, 245 UNION ALL
  SELECT 4, 198 UNION ALL
  SELECT 5, 167 UNION ALL
  SELECT 6, 154 UNION ALL
  SELECT 7, 132 UNION ALL
  SELECT 8, 118 UNION ALL
  SELECT 9, 95 UNION ALL
  SELECT 10, 87 UNION ALL
  SELECT 11, 4 UNION ALL
  SELECT 12, 3
) t ON t.product_id = p.id
LEFT JOIN (
  SELECT product_id, SUM(quantity) AS real_sales
  FROM order_items
  WHERE order_id < 900000 OR order_id > 900999
  GROUP BY product_id
) s ON s.product_id = p.id
WHERE GREATEST(t.target_sales - COALESCE(s.real_sales, 0), 0) > 0;

COMMIT;
