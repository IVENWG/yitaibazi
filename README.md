# 已泰八字 (YiTai BaZi)

基于 Node.js 的八字排盘与命理分析开源工具。

从南方批八字软件逆向代码移植，移除所有恶意代码、授权验证、硬件指纹采集，纯算法实现。

## 功能

- 四柱八字排盘（年柱、月柱、日柱、时柱）
- 真太阳时转换
- 节气精确判定
- 五行分析（计数、得分、喜忌）
- 十神判定
- 大运流年计算
- 称骨算命
- 命理分析报告

## 使用

```bash
# 安装
npm install

# 命令行排盘
node bin/cli.js --year 1990 --month 8 --day 15 --hour 14 --minute 30 --city 北京

# 或作为库使用
const { computeBaZi } = require('./src');
const result = computeBaZi({ year: 1990, month: 8, day: 15, hour: 14, minute: 30, city: '北京' });
```

## 项目结构

```
src/
├── core/           # 核心算法
│   ├── constants.js  # 天干地支、查找表
│   ├── calendar.js   # 历法转换、节气判定
│   ├── solar-time.js # 真太阳时
│   ├── pillars.js    # 四柱计算
│   └── dayun.js      # 大运计算
├── analysis/       # 分析模块
│   ├── wuxing.js     # 五行分析
│   ├── shishen.js    # 十神
│   └── chenggu.js    # 称骨算命
├── data/           # 静态数据（从 MDB 导出）
│   ├── calendar.json
│   ├── cities.json
│   └── equation-of-time.json
├── utils/          # 工具函数
└── index.js        # 主入口
```

## 许可证

MIT
