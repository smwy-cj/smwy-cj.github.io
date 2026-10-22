---
layout: article
title: Agent_loop 简介与最小伪代码演化
description: 介绍 agent 如何从最简循环逐渐加入上下文、内外部工具、扩展协作、治理与安全等功能
date: '2026-10-21'
category: 学习随笔
directory: 知识整理
tags:
  - Markdown
  - 学习笔记
  - Agent
  - ReAct
featured: true
sample: false
---

## 简介

**Agent_loop** 工作的核心架构如下：

$$Goal ➡ LLM ➡ Action ➡ Environment ➡ Observation ➡ Update Context ➡ (Next\ turn)LLM
$$

### ReAct

**ReAct** 是一种经典 Agent Loop 思路：

```
Reason
 ↓
Action
 ↓
Observation
 ↓
Reason
```

其核心思想是：将 Reasoning 与 Acting 交替进行，并利用行动得到的 Observation 支持下一轮推理。

## 最简while循环

无harness的最简工作方式：与llm的工作方式类似

```Python
# 最简单循环，无harness
function agent_loop(goal):
	context = [goal] # 获取任务本身
	while True:
		text = LLM(context)
		context += message("assistant", text) # 把回复加入历史，此时还不能成为上下文
		if looks_done(text):
			return text # 工作结束，返回最终内容
```

agent 本质上是一个 while 循环，不断通过添加上下文信息给 LLM ，它产出这一轮的 action，然后再进入下一轮循环直至任务中止

## 加入 Tools

加入外部 Tools ，使得 agent 不仅能根据 context 进行文本操作，还可以调用其他工具处理信息

```Python
function agent_loop(goal):
	context = [goal] # 获取上下文信息
	tools = register_builting_tools() # 通过MCP加入库中的工具
	while True:
		# text = LLM(context)
		text, action = LLM(context, tools) # 可调用工具得到回复与动作
		context += message("assistant", [text, action]) # 把回复加入上下文
		if action.type == "done":
			return text # 工作结束，返回最终内容
		if action.type == "call_tool":
			result = run_tool(tools[action.tool], action) # 执行具体的工具调用
			context += message("user", result)
```

LLM 从既能返回文本内容，还能进行具体的工具调用，此处还与[MCP](obsidian://open?vault=Jay-Knowledge-base&file=08_blog%2FAgent%2FMCP%20%E5%8D%8F%E8%AE%AE)y有关

## 加入上下文

CE：context Engineering 自此模型真正的开始与harness一同工作

```Python
function build_agent(project):
    system_prompt = vendor_system_prompt()  # 产品级 harness 的核心，各厂商核心竞争力
    rules = load_rule_files("CLAUDE.md", "AGENTS.md") # 【规则文件】启动自动加载的声明式约束

    tools     = register_builtin_tools() # 可调用的外部工具
    memory    = open_memory()            # 跨会话长期记忆的读写口
    retriever = open_retriever()         # [^2]【RAG / Select】按需把外部知识检索进上下文

    return Harness(system_prompt, rules, tools, memory, retriever)

# agent 的初始装配，在 LLM 正式开始工作之前

function agent_loop(goal, H):
	context = goal # 把目标先加入文本 
	context += H.system_propmt # 先加入各厂商设定的 prompt
	context += H.rules # 再加入自身预设在 claude.md 中的内容
	context += H.memory.read(goal) # 再加入历史对话中与goal相关的内容
	context += H.retriever.retrieve(goal) # 先在知识库内与goal相关的内容与资料
	
	# 设置一次工作的状态
	done = False
	ans = None
	steps = 0
	
	# 正式开始工作
	while not done and steps < Limited_steps:
		step += 1
		
		# [^1]熵管理 CE-conpress 当输入文本长度过长时需要进行压缩
		if token_count(context) > Limit:
			context = compact(context) 
		
		menu = H.tools.list() # 显示有哪些可以调用的工具
		
		text, action = LLM(context, menu) # LLM 出现在此，给出下一步工作指令
		context += message("assistant", [text, action])
		
		if action.type == "done":
			done = true
			ans = text
			continue
		
		if action.type == "call_tool":
			result = run_tool(H.tools[action.tool], action.args)
			context += message("user", result)
		
		elif action.type == "take_note":
			H.memory.write(action.note) # Harness 自动更新历史记忆
	
	# 循环退出后还要进行记忆固定，零散笔记固定成长期记忆
	H.memory.consolidate(context)
	return ans
```

可以发现，产品级 Harness 从这里开始就显露雏形了：**产商自研prompt**，**上下文记忆**，**外部工具**，**可检索知识库**等均成为一个成熟的 Harness 必不可少的东西

## 治理与安全

治理与安全部分或许是一个 agent 可以在实际生产生活中落地最关键的部分，需要确保在产生系统级风险的时候人为可控，且整体执行过程可监督、可追踪、可恢复。
### 目前存在哪些安全风险

[OWASP （2025.12）发布top10典型风险](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
可以注意以下几点

| 风险                       | 具体表现                |
| ------------------------ | ------------------- |
| Goal Hijacking（目标劫持）     | 通过恶意输入改变 Agent 原有目标 |
| Tool Misuse（工具滥用）        | 使用合法工具执行危险操作        |
| Privilege Abuse（权限滥用）    | 利用过高权限访问敏感资源        |
| Memory Poisoning（记忆投毒）   | 向长期记忆注入虚假或恶意信息      |
| Cascading Failures（级联故障） | 多 Agent 协作时错误不断传播   |
### 伪代码实现

在较为简单的实现版本中，我们可以考虑如下几点
- agent 能做什么 —— 权限与行为边界（guardrail，hooks）（治理）
- agent 应该做什么 —— 目标约束与行为规范（sandbox）（安全）
- 人为监督在何处实现？
- 风险产生时如何监控、追踪与恢复？
![[Pasted image 20261020104039.png|407]]

```Python
function build_agent(project): # agent 正式开始工作前的一次性 harness 准备
	system_prompt = vendor_system_project()
	rules = load_rule_files("CLAUDE.md", "Agents.md")
	tools = register_builtin_tools()
	hooks = register_hooks() # [^3]绑在生命周期事件上的脚本
	guardrail = register_guardrails() # [^4]权限门控，危险动作的策略闸:产品级 harness 最显眼的部件
	sandbox = create_sandbox(limits) # [^5]架构约束，给一切执行加上隔离与资源上限
	tracer = open_trace() # [^6]追踪器，用于观测与回溯每一步
	memory = open_memory()
	retriever = open_retriever()
	
	return Harness(system_prompt, rules, tools, hooks, guardrail, sandbox, tracer, memory, retriever)
	
function agent_loop(goal, H):
	context = goal
	context += H.system_prompt
	context += H.rules
	context += H.memory.read(goal)
	context += H.retriever.retrieve(goal)
	
	# 初始状态
	done = False
	ans = None
	steps = 0
	
	while not done and steps < MAX_limits:
		steps += 1
		
		if Tokens_count(context) > Limit:
			context = compact(context)  # CE-compress
		
		menu = H.tools.list() # 可调用的工具
		
		text, aciton = LLM(context, menu)
		context += message("assistant", [text, action]) # 这行的目的是，多轮迭代时让llm每轮记得自己说过什么
		
		H.tracer.record(text, aciton) # 记录这一轮的回复与动作
		
		if action.type == "done"
			done = true
			ans = text
			continue
		
		if not H.guardrail.allow(action): # 先拦截危险动作，可进行人工审批
			context += message("user", "该动作被策略拦截");continue
			
		verdict = run_hooks(H.hooks, "PreToolUse", action) # 实际执行前触发，PretoolUse也能拦截
		if verdict == "deny":
			context += message("user", "被hook拦截") # 可见 Guardrail 与 Hooks 实为同一套闸的两种用法
		
		if action.type == "call_tool":
			result = H.sandbox.run(H.tools[acyion.tool], action.args) # 内建工具实际在沙箱执行
			context += message("user", result) # 调用工具作为结果返回
		elif action.type == "take_note":
			H.memory.write(action.note)
			
		run_hooks(H.hooks, "PostToolUse", action) #【Hooks】执行后触发
	# 收尾工作，任务结束后只跑一次
	run_hooks(H.hooks, "SessionEnd", None) #【Hooks】会话结束事件:装配时注册,结尾触发
	H.memory.consolidate(context)
	H.tracer.flush() # 记录整次事件
	return ans
```

- **guardrail** 目前只用来在**最开始**拦截不被允许的**危险动作**，必要时转向人工审核
- **hooks** 则是通过三个节点（PreToolUse，PostToolUse， SessionEnd）自动检查 action 是否合适
- **tracer** 则是保持对整个事件流程的记录与追踪

这三个部件构成了最基础的 agent 治理与安全

## 扩展与协作

扩展主要是指以下三点：
1. 用 skill 来丰富 agent 对于特定任务的处理方式
2. 用 MCP + 外部 Tools 的方式来提供 agent 与其他应用的协作
3. multi_agent 与 sub_agent 增强多场景下的智能体协作能力

```Python
function build_agent(project):

    system_prompt = vendor_system_prompt()
    rules     = load_rule_files("CLAUDE.md", "AGENTS.md") 
    skills    = register_skills()        # 只记录当前项目可使用的skills，但不加载具体文件
    tools     = register_builtin_tools()
    mcp       = connect_mcp_servers()    # 把外部工具按统一协议接进来(N+M),不为每个工具改代码
    hooks     = register_hooks()        
    guardrail = register_guardrail()     
    sandbox   = create_sandbox(limits)  
    tracer    = open_trace()         
    memory    = open_memory()           
    retriever = open_retriever()       
    return Harness(system_prompt, rules, skills, tools, mcp, hooks, guardrail, sandbox, tracer, memory, retriever)

function agent_loop(goal, H, depth=0):  # H = 装配好的 harness;depth 给子 agent 防递归过深

    context  = H.system_prompt           
    context += H.rules                   
    context += H.memory.read(goal)       
    context += H.retriever.retrieve(goal)
    context += goal

    # 注:除开局预检索,菜单里还放了 search / read_file / memory 等工具,
    #     让模型在循环内按需取数(just-in-time),而非一次性全部放入
    done   = False
    answer = None
    steps  = 0

    while not done and steps < MAX_STEPS:   
        steps += 1
        if token_count(context) > LIMIT:
            context = compact(context)  
            
        # 把“可用功能菜单”提供给大脑:内建工具 + MCP 工具 + Skill 名片(真实系统还含 search/memory 等工具)
        menu = H.tools.list() + H.mcp.list_tools() + H.skills.list_descriptions()

        text, action = LLM(context, menu) 
        context += message("assistant", [text, action])
        H.tracer.record(text, action)
         
        if action.type == "done":
            done   = True
            answer = text               
            continue

        if not H.guardrail.allow(action):       
            context += message("user", "该动作被策略拦截"); continue   # 高风险时在此停下等人工审批(HITL)

        verdict = run_hooks(H.hooks, "PreToolUse", action) 
        if verdict == "deny":                       
            context += message("user", "被 Hook 拦截"); continue


        if action.type == "use_skill":
            instructions = H.skills.load(action.name)  # 命中才把 SKILL.md 全文读进上下文
            context += message("user", instructions)   # 载入的 SKILL.md 全文作为 user 消息进上下文(读入指令文本而非运行;脚本随后走 call_tool)

        elif action.type == "call_tool":                  # 区分:工具从哪来
            if action.tool in H.mcp:
                result = H.mcp.call(action.tool, action.args)  
            else:
                result = H.sandbox.run(H.tools[action.tool], action.args)
            context += message("user", result) 
            
        elif action.type == "spawn_subagent":    # 进入多智能体协作模式，调用子智能体
            if depth >= MAX_DEPTH:                       
                context += message("user", "子 agent 嵌套已达深度上限,拒绝派发"); continue
            child_H  = H.restrict(action.scope)  # 子 agent 通常拿“受限 harness”:别的提示词 / 工具子集 / 更小模
            summary  = agent_loop(action.subtask, child_H, depth + 1)  #   开独立上下文递归自己,也可并行 fan-out 多个
            context += message("user", summary)   
            
            
        elif action.type == "take_note":
            H.memory.write(action.note)                  
            
        run_hooks(H.hooks, "PostToolUse", action)         

    run_hooks(H.hooks, "SessionEnd", None)  
    H.memory.consolidate(context)       
    H.tracer.flush()                 
    return answer
```

skill 与 MCP 需要在一开始就加载进 Harness 之中
并且在 action 选择的时候进行具体调用

多智能体的实现方式又是怎样的呢？

## 反馈闭环

反馈闭环也是 agent 完整迭代至关重要的一部分，比如在 tools 调用的过程中：理想状况当然是任务顺利完成，可是一旦**工具调用失**败 llm 应该如何根据反馈信息进一步更新操作？

代码示例以工具调用的异常检查为例：
```Python
function agent_loop(goal, H, depth = 0):
...
	elif action.type == call.tool:
		try:
			if action.tool in H.mcp:
				result = H.mcp.call(action.tool, action.args)
			else:
				result = H.sandbox.run(H.tools[action.tool], action.args)
		except ToolError as e:
			result = "工具调用失败：" + e.message
		context += message("User", result) # 把工具调用成功与否的信息加入文本
...

...
	if action.changed_code:
		report = run_sensors(tests, lint, types, CI) # 告诉 agent 它做错没:测试/Lint/类型/CI
		context += message("User", report) # 失败信息作为一条 user 消息回灌,agent 据此自我修正
...
```

## 脚注

[^1]: 上下文窗口会随多轮累积而膨胀、被无关内容稀释(上下文腐化)。熵管理在窗口将满时压缩 / 裁剪,保住高信号 token。它是 CE 四件事里的 Compress，主动的工程工作,而非被动等窗口被塞满。

[^2]: Retrieval-Augmented Generation，把与当前任务相关的外部知识检索出来、纳入上下文，给模型事实锚点。它是 CE 四件事里的 Select:不是把所有信息放进去，而是只检索「这一步需要的恰到好处的信息」。检索有两个时机：开局一次性预检索（代码里这行），以及更现代的 just-in-time，模型在循环内用搜索/读文件工具按需取数（Claude Code 即用 glob/grep 即时检索），二者常混合使用。

[^3]: 绑定到生命周期事件（执行前 PreToolUse、执行后 PostToolUse、会话开始/结束）的脚本。它让某些检查「自动发生」而无需提示，就像 Git hooks，只不过是给 Agent 用的。它不止能旁观:PreToolUse 钩子可以返回 deny 直接拦下这次工具调用,所以它和 Guardrail 常是同一套闸的两种用法（一个「拦」,一个「触发」）。**权限拦截、格式检查、密钥扫描**常由 Hook 实现。

[^4]: 在动作执行「之前」做策略检查,把危险动作先拦下来。高风险场景(删库、转账、对外发布)在这里停下，转人工审批（Human-in-the-Loop）。它和 Hooks 常是同一套机制的不同用法：Guardrail 是「拦」，Hooks 是「触发」。

[^5]: 给 Agent 的每一次执行加上隔离边界与资源上限（CPU、内存、超时、文件系统范围）。Sandbox 是「架构约束」最硬的一种：类型系统、目录边界、容器隔离，本质都是用结构限制 Agent 的行动空间，把风险关进笼子。

[^6]: 记录 Agent 的每一步决策与动作，事后可回放、可审计、可调试。注意它的双节奏：record 在循环内每轮都跑，而且记的是「决策 + 观察结果」成对的轨迹，否则只剩决策、回放不出究竟发生了什么；flush 在会话末最终落盘。真实系统还会循环内增量落盘，否则中途崩溃就丢了整条决策链。此外，产品级 harness 常在每步对文件状态另做快照(如 git write-tree)，工具失败时回滚到上一快照、防止仓库被改坏——这是与决策轨迹互补的「状态快照 / checkpoint」，OpenCode、Claude Code 都有。
