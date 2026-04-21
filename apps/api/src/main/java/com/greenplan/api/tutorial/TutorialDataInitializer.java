package com.greenplan.api.tutorial;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class TutorialDataInitializer implements ApplicationRunner {

    private final TutorialRepository tutorialRepository;

    public TutorialDataInitializer(TutorialRepository tutorialRepository) {
        this.tutorialRepository = tutorialRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (tutorialRepository.count() > 0) {
            return;
        }

        tutorialRepository.saveAll(List.of(
                tutorial("HOT", 1, "热门推荐", null, "阳台番茄从零到收获全攻略", "手把手教你在阳台种出饱满多汁的番茄，适合完全零基础的新手。", null, null, "linear-gradient(135deg, #1f7a41, #34d399)", false),
                tutorial("HOT", 2, "本周精选", null, "春季播种时间表与品种推荐", "根据你所在的地区气候，选择最合适的春播品种和时间窗口。", null, null, "linear-gradient(135deg, #2563eb, #60a5fa)", false),
                tutorial("HOT", 3, "新手必读", null, "浇水的学问: 频率、水量与时机", "90% 的新手植物死亡都和浇水有关，这篇帮你彻底搞懂。", null, null, "linear-gradient(135deg, #d97706, #fbbf24)", false),
                tutorial("LIST", 1, "播种", "seed", "播种前如何选种与处理", "介绍适合阳台与庭院的新手种类，并说明浸种、催芽的基础步骤。", "入门", 5, "linear-gradient(135deg, #dff4e4, #b6e8c4)", true),
                tutorial("LIST", 2, "播种", "seed", "育苗盘使用与移栽时机", "从播种到移栽的完整流程，避免伤根和缓苗期过长。", "入门", 8, "linear-gradient(135deg, #dff4e4, #b6e8c4)", false),
                tutorial("LIST", 3, "养护", "care", "幼苗阶段的光照与浇水", "帮助你避免徒长、积水烂根等常见问题。", "入门", 6, "linear-gradient(135deg, #dbeafe, #93c5fd)", false),
                tutorial("LIST", 4, "养护", "care", "家庭肥料搭配与施肥节奏", "有机肥、复合肥怎么选，多久施一次最合适。", "中级", 7, "linear-gradient(135deg, #dbeafe, #93c5fd)", false),
                tutorial("LIST", 5, "防治", "pest", "家庭园艺病虫害预防", "从物理防护到日常巡检，降低病虫害发生概率。", "中级", 10, "linear-gradient(135deg, #fef3c7, #fde68a)", true),
                tutorial("LIST", 6, "防治", "pest", "常见叶片问题诊断图鉴", "黄叶、卷叶、斑点？对照图片快速判断原因。", "入门", 5, "linear-gradient(135deg, #fef3c7, #fde68a)", false),
                tutorial("LIST", 7, "进阶", "advanced", "阳台微型堆肥实操指南", "厨余变沃土，小空间也能做堆肥。", "进阶", 12, "linear-gradient(135deg, #ede9fe, #c4b5fd)", false),
                tutorial("LIST", 8, "四季", "seasonal", "四季适合播种的品种速查", "按季节筛选更容易成功的作物，附推荐品种清单。", "入门", 4, "linear-gradient(135deg, #fce7f3, #f9a8d4)", false),
                tutorial("LIST", 9, "工具", "tool", "新手园艺工具选购建议", "花盆、铲子、喷壶...哪些值得买，哪些可以省。", "入门", 6, "linear-gradient(135deg, #f3f4f6, #d1d5db)", false)
        ));
    }

    private Tutorial tutorial(
            String displayArea,
            int displayOrder,
            String tag,
            String categoryCode,
            String title,
            String description,
            String difficulty,
            Integer durationMinutes,
            String backgroundStyle,
            boolean favoriteDefault
    ) {
        Tutorial tutorial = new Tutorial();
        tutorial.setDisplayArea(displayArea);
        tutorial.setDisplayOrder(displayOrder);
        tutorial.setTag(tag);
        tutorial.setCategoryCode(categoryCode);
        tutorial.setTitle(title);
        tutorial.setDescription(description);
        tutorial.setDifficulty(difficulty);
        tutorial.setDurationMinutes(durationMinutes);
        tutorial.setBackgroundStyle(backgroundStyle);
        tutorial.setFavoriteDefault(favoriteDefault);
        tutorial.setPublished(true);
        return tutorial;
    }
}
