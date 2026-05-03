package com.greenplan.api.demo;

import com.greenplan.api.admin.Announcement;
import com.greenplan.api.admin.AnnouncementRepository;
import com.greenplan.api.admin.Promotion;
import com.greenplan.api.admin.PromotionPost;
import com.greenplan.api.admin.PromotionPostRepository;
import com.greenplan.api.admin.PromotionRepository;
import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.inventory.InventoryInboundEntry;
import com.greenplan.api.inventory.InventoryInboundEntryRepository;
import com.greenplan.api.inventory.InventoryItemRepository;
import com.greenplan.api.inventory.InventoryMovement;
import com.greenplan.api.inventory.InventoryMovementRepository;
import com.greenplan.api.orders.Order;
import com.greenplan.api.orders.OrderItem;
import com.greenplan.api.orders.OrderItemRepository;
import com.greenplan.api.orders.OrderRepository;
import com.greenplan.api.reviews.ProductReview;
import com.greenplan.api.reviews.ProductReviewRepository;
import com.greenplan.api.reporting.SalesDailySummary;
import com.greenplan.api.reporting.SalesDailySummaryRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DemoDataBackfillInitializer {

    private final AnnouncementRepository announcementRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionPostRepository promotionPostRepository;
    private final InventoryInboundEntryRepository inboundEntryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryMovementRepository movementRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductReviewRepository productReviewRepository;
    private final SalesDailySummaryRepository salesDailySummaryRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public DemoDataBackfillInitializer(
            AnnouncementRepository announcementRepository,
            PromotionRepository promotionRepository,
            PromotionPostRepository promotionPostRepository,
            InventoryInboundEntryRepository inboundEntryRepository,
            InventoryItemRepository inventoryItemRepository,
            InventoryMovementRepository movementRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductReviewRepository productReviewRepository,
            SalesDailySummaryRepository salesDailySummaryRepository,
            UserRepository userRepository,
            ProductRepository productRepository
    ) {
        this.announcementRepository = announcementRepository;
        this.promotionRepository = promotionRepository;
        this.promotionPostRepository = promotionPostRepository;
        this.inboundEntryRepository = inboundEntryRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.movementRepository = movementRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productReviewRepository = productReviewRepository;
        this.salesDailySummaryRepository = salesDailySummaryRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void backfill() {
        inventoryItemRepository.initializeMissingVersions();

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            return;
        }

        Long adminId = getUserId("admin", RoleCode.ADMIN);
        Long buyerId = getUserId("buyer", RoleCode.BUYER);
        Long stockAdminId = getUserId("stockadmin", RoleCode.INVENTORY_MANAGER);

        if (announcementRepository.count() == 0) {
            seedAnnouncements(adminId);
        }

        if (promotionRepository.count() == 0) {
            seedPromotions(adminId);
        }

        List<Promotion> promotions = promotionRepository.findAll();
        if (promotionPostRepository.count() == 0 && !promotions.isEmpty()) {
            seedPromotionPosts(adminId, promotions);
        }

        if (inboundEntryRepository.count() == 0) {
            seedInboundEntries(stockAdminId, products);
        }

        if (movementRepository.count() == 0) {
            seedInventoryMovements(stockAdminId, products);
        }

        if (orderRepository.count() == 0) {
            seedOrdersAndItems(buyerId, products);
        } else if (orderItemRepository.count() == 0) {
            seedOrderItemsForExistingOrders(products);
        }

        if (productReviewRepository.count() == 0) {
            seedReviews(buyerId, products);
        }

        if (salesDailySummaryRepository.count() == 0) {
            seedSalesDailySummary();
        }
    }

    private Long getUserId(String username, RoleCode preferredRole) {
        User user = userRepository.findByUsername(username)
                .filter(item -> item.getRoleCode() == preferredRole)
                .or(() -> userRepository.findAll().stream()
                        .filter(item -> item.getRoleCode() == preferredRole)
                        .findFirst())
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new IllegalStateException("Missing seed user for role: " + preferredRole));
        return user.getId();
    }

    private void seedAnnouncements(Long adminId) {
        List<AnnouncementSeed> seeds = List.of(
                new AnnouncementSeed("社区公约更新通知", "为了营造友好交流环境，社区公约已更新，请大家遵守文明发言和晒图规范。", 1),
                new AnnouncementSeed("春季种子交换活动", "本月开启春季种子交换，欢迎带上你多余的番茄、生菜和香草种子参与。", 2),
                new AnnouncementSeed("新增晒图分享话题", "发帖时可带图参与晒图分享，本周精选内容会展示在首页推荐位。", 3),
                new AnnouncementSeed("本周六社区直播预告", "周六晚 20:00 将直播分享家庭阳台春播流程，直播结束后回放同步开放。", 4),
                new AnnouncementSeed("积分商城即将上线", "互动、回帖和完成教程学习都将累计积分，积分商城正在准备首批兑换商品。", 5),
                new AnnouncementSeed("园艺工具团购第二期", "育苗盘、喷壶和补光灯团购第二期开启，达到成团人数即可享受阶梯优惠。", 6),
                new AnnouncementSeed("本周主题：晒出你的阳台春播进度", "发帖带图更容易获得互动，本周精选会展示在首页推荐位。", 0),
                new AnnouncementSeed("教程中心新增入门专题", "新手专区已补充阳台番茄、香草养护和播种发芽记录，欢迎前往查看。", 7)
        );

        List<Announcement> announcements = seeds.stream().map(seed -> {
            Announcement announcement = new Announcement();
            announcement.setTitle(seed.title());
            announcement.setContent(seed.content());
            announcement.setStatus("PUBLISHED");
            announcement.setCreatedBy(adminId);
            announcement.setPublishedAt(LocalDateTime.now().minusDays(seed.daysAgo()).withHour(9).withMinute(0));
            return announcement;
        }).toList();

        announcementRepository.saveAll(announcements);
    }

    private void seedPromotions(Long adminId) {
        List<PromotionSeed> seeds = List.of(
                new PromotionSeed("春季种子大促", "home", "春季播种必备种子组合，限时低至 8 折。", "spring-seeds.jpg"),
                new PromotionSeed("新品上市", "home", "新品园艺工具套装上架，适合阳台和庭院双场景。", "new-products.jpg"),
                new PromotionSeed("会员专享", "home", "登录会员账户可领取额外折扣和包邮券。", "member-only.jpg"),
                new PromotionSeed("阳台轻量种植方案", "home", "从育苗盘到喷壶，一次配齐新手阳台种植清单。", "balcony-kit.jpg"),
                new PromotionSeed("满减活动", "product", "种子、工具和肥料混搭满 99 元立减 10 元。", "discount.jpg"),
                new PromotionSeed("买赠活动", "product", "购买种子套装赠送育苗营养土，适合春播起步。", "gift.jpg"),
                new PromotionSeed("限时秒杀", "product", "每日中午开放精选商品秒杀，库存售完即止。", "flash-sale.jpg"),
                new PromotionSeed("夏季香草专区预热", "product", "罗勒、薄荷与迷迭香专区上线，提前锁定夏季香草清单。", "herb-special.jpg")
        );

        List<Promotion> promotions = new ArrayList<>();
        for (PromotionSeed seed : seeds) {
            Promotion promotion = new Promotion();
            promotion.setTitle(seed.title());
            promotion.setStrategyType(seed.strategyType());
            promotion.setDescription(seed.description());
            promotion.setImageUrl(seed.imageUrl());
            promotion.setStatus("PUBLISHED");
            promotion.setCreatedBy(adminId);
            promotions.add(promotion);
        }

        promotionRepository.saveAll(promotions);
    }

    private void seedPromotionPosts(Long adminId, List<Promotion> promotions) {
        String[] channels = {"community", "home", "product"};
        List<PromotionPost> posts = new ArrayList<>();

        for (int index = 0; index < 8; index++) {
            Promotion promotion = promotions.get(index % promotions.size());
            PromotionPost post = new PromotionPost();
            post.setPromotionId(promotion.getId());
            post.setChannel(channels[index % channels.length]);
            post.setContent("【" + promotion.getTitle() + "】" + promotion.getDescription() + " 立即进入活动页查看详情。");
            post.setImageUrl(promotion.getImageUrl());
            post.setPostStatus("PUBLISHED");
            post.setPublishedAt(LocalDateTime.now().minusDays(index).withHour(11).withMinute(30));
            post.setCreatedBy(adminId);
            posts.add(post);
        }

        promotionPostRepository.saveAll(posts);
    }

    private void seedInboundEntries(Long stockAdminId, List<Product> products) {
        List<InventoryInboundEntry> entries = new ArrayList<>();
        for (int index = 0; index < 8; index++) {
            Product product = products.get(index % products.size());
            InventoryInboundEntry entry = new InventoryInboundEntry();
            entry.setProductId(product.getId());
            entry.setQuantity(18 + index * 4);
            entry.setNote("第 " + (index + 1) + " 批春季补货入库");
            entry.setCreatedBy(stockAdminId);
            entries.add(entry);
        }
        inboundEntryRepository.saveAll(entries);
    }

    private void seedInventoryMovements(Long stockAdminId, List<Product> products) {
        String[] types = {"INBOUND", "OUTBOUND", "ADJUST"};
        List<InventoryMovement> movements = new ArrayList<>();

        for (int index = 0; index < 10; index++) {
            Product product = products.get(index % products.size());
            InventoryMovement movement = new InventoryMovement();
            movement.setProductId(product.getId());
            movement.setType(types[index % types.length]);
            movement.setQuantity(types[index % types.length].equals("OUTBOUND") ? -(index + 2) : (index + 3) * 2);
            movement.setSourceRefType(index % 2 == 0 ? "PURCHASE" : "ORDER");
            movement.setSourceRefId("REF-" + (20260410 + index));
            movement.setOperatorUserId(stockAdminId);
            movement.setRemark(index % 2 == 0 ? "采购入库补货" : "订单出库或盘点调整");
            movements.add(movement);
        }

        movementRepository.saveAll(movements);
    }

    private void seedOrdersAndItems(Long buyerId, List<Product> products) {
        LocalDateTime baseTime = LocalDateTime.now().minusDays(8).withHour(10).withMinute(0);
        for (int index = 0; index < 8; index++) {
            Product first = products.get(index % products.size());
            Product second = products.get((index + 1) % products.size());

            List<OrderItem> items = new ArrayList<>();
            items.add(buildOrderItem(first, index < 2 ? 2 : 1));
            if (index < 2) {
                items.add(buildOrderItem(second, 1));
            }

            BigDecimal totalAmount = items.stream()
                    .map(OrderItem::getLineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Order order = new Order();
            order.setOrderNo("GP" + (202604100001L + index));
            order.setBuyerId(buyerId);
            order.setStatus(index < 5 ? com.greenplan.api.common.OrderStatus.PAID : com.greenplan.api.common.OrderStatus.PAID);
            order.setTotalAmount(totalAmount);
            order.setShippingCarrier(index < 4 ? "顺丰速运" : null);
            order.setTrackingNo(index < 4 ? "SF20260417" + (100 + index) : null);
            order.setShippingStatus(index < 4 ? com.greenplan.api.common.ShippingStatus.IN_TRANSIT : com.greenplan.api.common.ShippingStatus.PENDING);
            order.setShippedAt(index < 4 ? baseTime.plusDays(index).plusHours(6) : null);

            Order savedOrder = orderRepository.save(order);
            for (OrderItem item : items) {
                item.setOrderId(savedOrder.getId());
            }
            orderItemRepository.saveAll(items);
        }
    }

    private void seedOrderItemsForExistingOrders(List<Product> products) {
        List<Order> orders = orderRepository.findAllByOrderByIdDesc();
        if (orders.isEmpty()) {
            return;
        }

        List<OrderItem> items = new ArrayList<>();
        int limit = Math.min(orders.size(), 8);
        for (int index = 0; index < limit; index++) {
            Product product = products.get(index % products.size());
            OrderItem item = buildOrderItem(product, index < 2 ? 2 : 1);
            item.setOrderId(orders.get(index).getId());
            items.add(item);
        }

        while (items.size() < 10) {
            int index = items.size();
            Product product = products.get(index % products.size());
            OrderItem item = buildOrderItem(product, 1);
            item.setOrderId(orders.get(index % limit).getId());
            items.add(item);
        }

        orderItemRepository.saveAll(items);
    }

    private OrderItem buildOrderItem(Product product, int quantity) {
        OrderItem item = new OrderItem();
        item.setProductId(product.getId());
        item.setProductNameSnapshot(product.getName());
        item.setPriceSnapshot(product.getPrice());
        item.setQuantity(quantity);
        item.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        return item;
    }

    private void seedReviews(Long buyerId, List<Product> products) {
        String[] contents = {
                "出芽率比预期高，阳台新手也能比较稳地种出来。",
                "包装清爽，说明清晰，按步骤操作就能很快上手。",
                "适合家庭种植，长势稳定，复购意愿很高。",
                "商品状态不错，搭配教程一起看更容易成功。",
                "发货之后跟踪清晰，收到时种子和工具都保存得很好。",
                "对阳台种植很友好，尺寸和用量都比较合适。",
                "图文信息和实际收到的商品一致，体验比较省心。",
                "作为入门组合很合适，已经推荐给身边朋友了。"
        };

        List<ProductReview> reviews = new ArrayList<>();
        for (int index = 0; index < 8; index++) {
            Product product = products.get(index % products.size());
            ProductReview review = new ProductReview();
            review.setProductId(product.getId());
            review.setProductNameSnapshot(product.getName());
            review.setBuyerId(buyerId);
            review.setBuyerUsernameSnapshot(userRepository.findById(buyerId).map(User::getUsername).orElse("buyer"));
            review.setRating(index % 3 == 0 ? 5 : 4);
            review.setContent(contents[index % contents.length]);
            reviews.add(review);
        }
        productReviewRepository.saveAll(reviews);
    }

    private void seedSalesDailySummary() {
        List<SalesDailySummary> rows = new ArrayList<>();
        for (int index = 0; index < 8; index++) {
            SalesDailySummary summary = new SalesDailySummary();
            summary.setBizDate(LocalDate.now().minusDays(7L - index));
            summary.setOrdersCount(4 + index);
            summary.setUnitsSold(9 + index * 2);
            summary.setGrossSales(new BigDecimal(180 + index * 36).setScale(2));
            rows.add(summary);
        }
        salesDailySummaryRepository.saveAll(rows);
    }

    private record AnnouncementSeed(String title, String content, int daysAgo) {
    }

    private record PromotionSeed(String title, String strategyType, String description, String imageUrl) {
    }
}
