---
layout: article
title: Skill 的工作原理与创建方式
description: 使用 Skill 让 ai 应用与 agent 应用学会处理更多特定任务
date: '2026-10-15'
category: 学习随笔
directory: 知识整理
tags:
  - Markdown
  - skill
  - Agent
featured: true
sample: false
---
## 简介

***Skill（技能）*：** 在AI agent之中，本质上为一套可复用的任务行为规范，在LLM遇见特定的任务时，可以按照预设的流程、规范和工具进行工作

[Skill详细介绍](https://agentskills.io/specification)

目前，主流大模型应用 [OpenAI Codex](https://developers.openai.com/api/docs/guides/tools-skills)、Claude 均可按照`skill.md`的行为规范搭建skill

## 创建

### 核心文件结构

一个可复用的skill：

```
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```


#### 核心文件：`skill.md`

`skill.md`：至少需要包含 `name` `description` YAML元数据字段（具体可见上述详细介绍）
- `name`：skill唯一名称，最好为小写字母＋数字
- `description`：说明skill的使用场景与何时调用
- 此外`skill.md` 最好还要包括md格式的正文，即实际工作流程，包括但不限于：license，**具体工作步骤**，约束边界，**输入输出格式**，可调用工具等

Minimal example：
```Markdown
---

name: skill-name
description: A description of what this skill does and when to use it.

---
```

#### 可选目录：

- `scripts/`：执行校验、计算、文件处理等确定性任务，一般多为可执行代码（`Python, Bash, Javascript`）

- `references/`：提供补充理论、规则与参考案例，一般多为md格式的细节与格式参考或特殊领域规范（`finance.md`, `legal.md`, etc）

- `assets/`：存放标准输出模板与静态资源，一般多为模板，图片，数据资源文件(lookup tables, schemas)


示例：
```txt
goal-modeling/
├── SKILL.md             # 核心定义（必需）
├── references/          # 领域知识（可选）
│   ├── kaos-rules.md
│   └── examples.md
├── scripts/             # 执行脚本（可选）
│   └── validate.py
└── assets/              # 输出模板（可选）
    └── goal-template.md
```

### 具体创建流程

仅以OpenAI Codex为例介绍skill创建的主流方式

#### 方式一：手动创建

手动创建可以分为项目级和用户级别两种方式

##### 项目级skill

即skill只可放在单项目内部使用

在项目根目录中创建`.agent/skills/<skill 名称>/SKILL.md`

```
your-project/
└── .agents/
    └── skills/
        └── goal-modeling/
            └── SKILL.md
```

使用方式：在codex中直接用自然语言：请用xx SKILL做……

##### 用户级skill

可以将skill放在 `.codex/skills/` 目录下 这样所有项目均可使用

#### 方式二：调用工具创建

使用Codex自带的  `$skill-creator` 辅助工具
用自然语言描述 `skill` 的名称，内容，边界，输入输出等参考信息

#### 方式三：API 托管执行环境创建

Upload multiple `files[]` parts. Each part includes the path inside a single top-level folder.

```
curl -X POST 'https://api.openai.com/v1/skills' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files[]=@./basic_math/SKILL.md;filename=basic_math/SKILL.md;type=text/markdown' \
  -F 'files[]=@./basic_math/calculate.py;filename=basic_math/calculate.py;type=text/plain'
```

Zip the top-level folder and upload the zip file.
```
curl -X POST 'https://api.openai.com/v1/skills' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files=@./basic_math.zip;type=application/zip'
```

该方式一般用于 **OpenAI API 构建独立的 Agent**

并且通过 `POST https://api.openai.com/v1/skills` 上传的 Skill，存储在 OpenAI API 服务端，而不是自动保存在本地项目或 `.codex/` 目录下。

使用：通过 Skill ID 调用

## 评估与对比

#### 评价skill

可从三个方面评价一个skill

|评估维度|具体问题|
|---|---|
|触发准确性|相关任务能否触发？无关任务是否会误触发？|
|执行正确性|是否严格遵循流程，输出是否满足领域规范？|
|稳定性|换一个案例，是否仍然能获得可靠的结果？|

#### skill任务规范与自动化workflow对比

skill 用于llm处理某一类特定的任务
自动化workflow 则是用于一类固定的工作流程

gpt从以下方面总结了两者的区别

| 对比维度 | Skill              | 自动化 Workflow      |
| ---- | ------------------ | ----------------- |
| 核心定位 | 可复用的能力模块           | 任务执行与编排机制         |
| 关注重点 | 如何完成某类任务           | 任务如何被触发、执行和衔接     |
| 执行方式 | Agent 根据任务动态调用     | 根据预设流程、条件或编排规则执行  |
| 灵活性  | 通常较高，可由 LLM 灵活推理   | 取决于设计，可固定也可动态     |
| 组成结构 | 指令、领域知识、脚本、模板      | 节点、任务、条件、依赖关系     |
| 触发机制 | Agent 按语义匹配或用户显式调用 | 定时、事件、API、用户请求等   |
| 典型用途 | 需求分析、代码审查、目标建模     | CI/CD、审批流程、自动生成报告 |

skill 或许更像给llm配备的一层固定"能力"
而自动化工作流则是一套固定的工作流程