# 移植记录

## 2026-05-31 初始版本

已完成：

1. 创建 Node.js 项目 `yitai-bazi`
2. 从 `PibaziCld.mdb` 导出核心数据表：
   - `calendar`：节气、农历月份、闰月、大小月数据（1881-2061）
   - `JingWeiShich`：地区经纬度与经度时差（2366 条）
   - `PingToZhen`：平太阳时转真太阳时时差（366 条）
   - `Chenggu`：称骨算命文本（52 条）
   - `textbook`：原软件内置文本库（187 条）
3. 移植核心常量表：
   - 十天干
   - 十二地支
   - 六十甲子
   - 节气/中气名称
   - 地支藏干
   - 称骨权重表
   - 五行与阴阳映射
4. 实现核心排盘：
   - 真太阳时换算（经度时差 + 平真时差）
   - 年柱（以立春为界）
   - 月柱（按节气月序起月干）
   - 日柱（移植原程序儒略日修正公式）
   - 时柱（五鼠遁）
5. 实现基础分析：
   - 五行统计
   - 十神判定
   - 称骨算命基础函数
6. 创建 CLI：
   - `node bin/cli.js --year 1990 --month 8 --day 15 --hour 14 --minute 30 --city 北京市区`

## 尚未完成

- 农历转换的完整封装（目前部分数据已导出，尚未暴露 API）
- 大运起运岁数与大运序列
- 原软件的五行打分矩阵（`a0.cs`）
- 格局判断
- 婚姻、事业、健康、性格等长文本分析模块
- Web UI / Electron UI
- 与原软件逐项对照测试

## 关键源文件映射

| 原 C# 文件 | Node.js 文件 | 说明 |
|---|---|---|
| `aq.cs` 静态构造函数 | `src/core/constants.js` | 天干地支、六十甲子、称骨权重 |
| `ap.cs` | `src/core/solar-time.js` | 真太阳时换算 |
| `am.cs` 节气部分 | `src/core/calendar.js` | 节气判定、年柱/月柱边界 |
| `aq.cs` `a_ref(year,month,day,hour)` | `src/core/pillars.js` | 日柱计算 |
| `aq.cs` `h_ref(hour)` | `src/core/pillars.js` | 时柱计算 |
| `aq.cs` `a_ref(dayStem, otherStem)` | `src/analysis/wuxing.js` | 十神判定 |
| `am.cs` 称骨部分 | `src/analysis/chenggu.js` | 称骨算命 |

## 注意

本项目第一版优先保证“可运行”和“核心排盘可验证”。后续应按模块逐步补齐，并使用原程序输出做回归测试。
