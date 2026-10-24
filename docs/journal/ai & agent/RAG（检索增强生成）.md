```layout: article
title: RAG 的简单介绍
description: RAG 的演化过程与伪代码实现
date: '2026-10-24'
category: 学习随笔
directory: 知识整理
tags:  
  - LLM
  - Agent
  - retrieve
  - RAG
    featured: true
    sample: false
```

## 简介

RAG：**Retrieval-Augmented-Genaration**（检索增强生成）

2020年 [RAG 概念的首次提出](https://dl.acm.org/doi/abs/10.5555/3495724.3496517)还是为了提升文本生成模型中知识密集型任务的答案准确率

当时工作流程

``````mermaid
flowchart TD
    A["输入问题 x"] --> B["Query Encoder BERT"]
    B --> C["生成问题向量 q(x)"]
    D["Wikipedia 文本"] --> E["Document Encoder BERT"]
    E --> F["文档向量索引 FAISS + HNSW"]
    C --> G["MIPS 相似度检索"]
    F --> G
    G --> H["Top-K 文档 z1, z2, ... zK"]
    A --> I["问题 + 检索文档"]
    H --> I
    I --> J["BART-large 分别对文档条件生成"]
    J --> K["潜在文档概率边缘化"]
    K --> L["输出答案 y"]
    style B fill:#dbeafe,color:#1e40af
    style E fill:#dbeafe,color:#1e40af
    style J fill:#d1fae5,color:#065f46
``````



而2026年，随着 LLM 与 Agent 快速发展，RAG 更多被视为一种**大模型应用系统架构**，通过**外部知识库**、检索与排序、上下文构造，让已有的 LLM 使用外部知识完成任务，而不需要重新训练 LLM。

在 [CE-Engineering]() 中 RAG 负责在模型开始工作前准备好与 goal 相关的外部资料而非历史上下文

## 经典技术架构

一个典型的 RAG 系统主要包括两个阶段：知识库构建（离线阶段）和检索增强生成阶段

其中：

- 数据加载 - chunking（文本切分）- Embedding（嵌入向量）- 建立向量与关键词索引属于前一阶段
- 混合检索（Hybrid Search）- 重排序（Reranker）- Prompt输出属于后一阶段

### 经典流程图

``````mermaid

flowchart TD
    A["外部数据
    PDF / 网站 / 代码 / 数据库"] --> B["数据解析与分块"]
    B --> C["Embedding + 元数据"]
    C --> D["向量索引与关键词索引"]
    E["用户问题"] --> F["查询理解 / 改写"]
    F --> G["混合检索"]
    D --> G
    G --> H["Reranker 重排序"]
    H --> I["构造上下文 Prompt"]
    E --> I
    I --> J["LLM 推理"]
    J --> K["答案 / 引用 / 校验"]
    style G fill:#dbeafe,color:#1e40af
    style H fill:#dbeafe,color:#1e40af
    style J fill:#d1fae5,color:#065f46
  
``````

### 伪代码示例

#### 构建向量知识库（离线阶段）

``````python
def build_knowledge_base(documents):
	vector_db = VectorDatabase() # 向量知识库初始化
	
	for document in documents:
		text = load_document(document)
		
		chunks = split_text(
			text,
			chunk_size = 500,
			overlap = 100
		) # 文本切分
		
		for chunk in chunks:
			vector = embedding_model.encode(chunk)
			
			vector_db.insert(
				vector = vector,
				content = chunk,
				metadata = {"source": document}
			)
	
	return vector_db
``````

其中，关键操作为：**split_text, embedding_model_encode(), vector_db.insert()**

#### 如何利用知识库回答问题

``````python
def rag_answer(question, vector_db):
    # 将用户问题转为向量
    query_vector = embedding_model.encode(question)

    # 检索最相关的文档片段
    documents = vector_db.search(
        query_vector,
        top_k=5
    )

    # 构建上下文
    context = format_documents(documents)

    # 组合 Prompt
    prompt = f"""
    请根据以下参考资料回答问题。

    参考资料：
    {context}

    用户问题：
    {question}

    要求：
    1. 优先依据参考资料回答
    2. 不要编造资料中没有的事实
    3. 如果证据不足，明确说明
    4. 标注使用的文档来源
    """

    # LLM 生成回答
    answer = llm.generate(prompt)

    return answer
``````

即：根据问题从db中检索相关资料与关键词，加入到当前上下文中，通过优化 Prompt 的方式交付给 LLM 进行答案的推理。

#### RAG 的 Reranker 与 Hybrid Search

``````python
def advanced_retrieve(query):
    # 语义检索(普通向量检索方式)
    semantic_docs = vector_db.search(
        embedding_model.encode(query),
        top_k=10
    )

    # 关键词检索(需要学习)
    keyword_docs = bm25.search(
        query,
        top_k=10
    )

    # 融合两类检索结果
    candidates = reciprocal_rank_fusion(
        semantic_docs,
        keyword_docs
    )

    # 使用 Reranker 重新排序
    ranked_docs = reranker.rank(
        query=query,
        documents=candidates
    )

    # 过滤低相关性内容
    relevant_docs = [
        doc for doc in ranked_docs
        if doc.relevance_score >= THRESHOLD
    ]

    return relevant_docs[:5]
``````

这样能结合两种检索方式的优势：

| 检索方式       | 擅长解决的问题           |
| -------------- | ------------------------ |
| Embedding 检索 | 语义相近但用词不同       |
| BM25 检索      | 精确术语、缩写、关键词   |
| Reranker       | 判断文档是否真正回答问题 |

另外 `THRESHOLD` 需要结合具体的重排序模型进行校准。

#### Agentic Agent

在 Agent 之中 RAG 的体现方式

从**固定流程** -> **动态决策**

``````python
def agentic_rag(user_query):
    # 初始化任务状态
    state = {
        "question": user_query,
        "evidence": [],
        "history": []
    }

    MAX_STEPS = 8

    for step in range(MAX_STEPS):
        # Agent 决策下一步行动
        decision = llm.plan(
            goal=user_query,
            evidence=state["evidence"],
            history=state["history"],
            available_actions=[
                "search_knowledge",
                "finish"
            ]
        )

        # Agent 决定检索
        if decision.action == "search_knowledge":
            documents = advanced_retrieve(
                decision.search_query
            )

            state["evidence"].extend(documents)
            state["history"].append({
                "action": "search",
                "query": decision.search_query,
                "result": summarize(documents)
            })

        # Agent 决定完成任务
        elif decision.action == "finish":
            return llm.generate_answer(
                question=user_query,
                evidence=state["evidence"]
            )

    # 超过最大步骤，使用已有证据生成答案
    # 并说明仍未解决的信息缺口
    return llm.generate_partial_answer(state)
``````

RAG 成为 Agent 可选择调用的 tools 的一部分，即可实现动态调用

#### 多种模式的对比

| 架构         | 检索方式          | 控制主体   | 适用场景                   |
| ------------ | ----------------- | ---------- | -------------------------- |
| Basic RAG    | 单次检索          | 固定程序   | 文档问答                   |
| Advanced RAG | 混合检索 + 重排序 | 固定程序   | 高质量知识检索             |
| Agentic RAG  | 动态多轮检索      | Agent 决策 | 复杂分析、多跳推理、长任务 |

## **应用场景**

目前，RAG 广泛应用于以下场景

1. 企业或个人知识库问答（智忆随记）

将论文、内部规范、个人笔记等接入知识库，使模型能够回答特定资料中的问题，而不必将所有文档一次性放入上下文。

2. 编程与代码库智能助手

检索项目源码、接口定义和技术文档，让 Agent 基于当前代码仓库分析模块依赖、解释程序以及辅助修改代码。

3. 科研与论文分析

从论文库中提取方法、实验设置和结论，支持跨论文比较、相关工作综述以及研究问题分析。

4. 智能客服与业务助理

依据最新产品手册、业务政策和常见问题库回答用户咨询，降低对过时模型知识的依赖。

5. Agent 长期记忆

从历史交互、任务经验或已有决策中检索相关信息，使智能体在跨会话执行任务时能够利用过去的上下文。

## RAG 与 Agent_loop 之间的关系

RAG 在 Harness 之中一般是负责知识库检索部分的工作，即提前帮 LLM 准备好与 goal 相关的资料与知识

[Agent_loop 回顾](./Agent_loop 简介与最小伪代码演化.md)

