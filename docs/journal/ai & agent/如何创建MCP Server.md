以 GoalForge 目标模型构建方向为例，创建一个 `Goal Modeling MCP Server`。

它提供三个能力：检查目标分解结构、读取 KAOS 建模规则、提供需求分析提示模板。

### Step 1：创建项目

建议使用 Python 和官方 MCP SDK。

```
# 创建项目
uv init goal-mcp
cd goal-mcp

# 安装 MCP SDK
uv add "mcp[cli]"
```

如果不使用 `uv`，也可以通过 `pip install "mcp[cli]"` 安装。

当前官方 Python SDK v2 要求 Python 3.11 及以上，并将原来常见的 `FastMCP` 类更名为了 `MCPServer`。因此旧教程中的导入方式可能与最新版不兼容。

项目目录：

```
goal-mcp/
├── server.py
├── pyproject.toml
└── uv.lock
```

### Step 2：编写 MCP Server

在 `server.py` 中编写：

```Python

from mcp.server import MCPServer

# 创建 MCP Server
mcp = MCPServer("Goal Modeling Server")


# 1. Tool：检查目标分解的基本结构
@mcp.tool()
def validate_goal_structure(
    parent: str,
    subgoals: list[str],
    refinement: str = "AND"
) -> dict:
    """检查 KAOS 目标分解的基本结构，不验证语义正确性。"""

    errors = []

    if not parent.strip():
        errors.append("父目标不能为空")

    if not subgoals:
        errors.append("至少需要一个子目标")

    if refinement not in ("AND", "OR"):
        errors.append("分解类型必须为 AND 或 OR")

    if any(not g.strip() for g in subgoals):
        errors.append("子目标不能为空")

    if parent in subgoals:
        errors.append("父目标不能直接作为自身的子目标")

    if len(subgoals) != len(set(subgoals)):
        errors.append("存在重复子目标")

    return {
        "valid": len(errors) == 0,
        "parent": parent,
        "refinement": refinement,
        "errors": errors
    }


# 2. Resource：提供领域规则
@mcp.resource("goal://kaos-rules")
def get_kaos_rules() -> str:
    """返回简化的 KAOS 目标建模规则。"""
    return """
    KAOS 目标建模规则：
    1. Goal 描述期望达成的状态。
    2. AND 分解要求全部子目标成立。
    3. OR 分解允许由备选方案满足父目标。
    4. 应检查目标之间的可追溯性。
    5. 应识别可能阻碍目标实现的障碍。
    """


# 3. Prompt：提供需求分析模板
@mcp.prompt()
def analyze_requirements(requirements: str) -> str:
    """根据需求文本生成目标建模分析提示。"""
    return f"""
    请基于 KAOS 方法分析以下需求：

    {requirements}

    请完成：
    1. 识别顶层目标
    2. 识别候选子目标
    3. 建议 AND/OR 分解关系
    4. 识别可能的障碍
    5. 标记不确定的推断
    """


if __name__ == "__main__":
    mcp.run()

```

这里有三个核心装饰器：

- `@mcp.tool()`：将 Python 函数注册为 MCP Tool。
  
- `@mcp.resource()`：注册可读取的上下文资源。
  
- `@mcp.prompt()`：注册可复用的提示模板。
  

SDK 会根据函数名称、类型注解与文档字符串生成工具定义和参数 Schema，并处理底层协议通信。

需要明确的是，这里的 `validate_goal_structure` 只能进行基础结构校验，无法证明 AND/OR 分解在语义上正确。后者还需要领域逻辑、约束求解或模型推理。

### Step 3：运行和调试

可以使用官方 MCP Inspector：

```
uv run mcp dev server.py
```

这会启动开发调试工具。终端将提供可打开的 Inspector 地址。
![[Pasted image 20261018173402.png]]

实际 Inspector 还可以检查 Tool、Resource、Prompt 的注册情况、参数和返回值。

### Step 4：连接到 Codex

如果你使用 VS Code 中的 Codex 或 Codex CLI，可以在 `~/.codex/config.toml` 中添加：

```

[mcp_servers.goal_modeling]
command = "uv"
args = [
    "run",
    "--directory",
    "/absolute/path/to/goal-mcp",
    "python",
    "server.py"
]
```

将目录替换为自己的实际项目路径，并确保 `uv` 可以被 Codex 找到。

也可以将配置放到项目级 `.codex/config.toml` 中，具体是否生效取决于 Codex 对项目配置的信任设置。

配置后可执行：

```
codex mcp list
```

查看已配置的 MCP Server。

之后在 Codex 中输入：

> 请调用 Goal Modeling MCP Server，检查“确保用户数据安全”及其两个子目标的 AND 分解结构。

Codex 就可以发现相应 Tool，并决定是否调用。

### Step 5：本地和远程部署

MCP 常见的两种传输方式如下：

|传输方式|stdio|Streamable HTTP|
|---|---|---|
|通信方式|标准输入与输出|HTTP 请求|
|部署位置|本地进程|本地或远程服务|
|使用场景|Codex、IDE、本地 Agent|Web Agent、云端系统、多用户|
|网络服务端口|不需要|通常需要|

前面的 `mcp.run()` 默认使用 `stdio`。

如果希望创建一个 HTTP MCP 服务，可以运行：

```
uv run mcp run server.py --transport streamable-http
```

按 SDK 的默认配置，通常通过 `http://localhost:8000/mcp` 访问。

`stdio` 非常适合初期学习；需要连接云端应用时，优先考虑 Streamable HTTP。正式对外部署还需要配置 HTTPS、身份认证、权限控制和日志，不能直接把无保护的开发服务暴露到公网。