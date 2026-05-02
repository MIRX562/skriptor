# Agent Rules — Next.js 16 & MCP

This project uses Next.js 16 and leverages the Model Context Protocol (MCP) for enhanced AI development and debugging.

## MCP Servers

The following MCP servers are available and should be used by AI agents:

1. **`next-devtools`**: Connects to the running Next.js development server.
   - **Usage**: Call `get_errors` to diagnose build or runtime issues.
   - **Usage**: Call `get_logs` to see live server/browser logs.
   - **Usage**: Call `get_routes` or `get_page_metadata` to understand the app structure.
   - **Requirement**: The development server must be running (`bun run dev`).

2. **`drizzle-mcp`**: specialized for Drizzle ORM and PostgreSQL.
   - **Usage**: Call `get_schema` or `list_tables` to understand the database structure.
   - **Usage**: Call `generate_migration` or `run_migration` via the agent to manage schema changes.
   - **Usage**: Call `execute_query` for data inspection and debugging.

3. **`next-upgrade`**: Specialized MCP server for Next.js 16 migrations.
   - **Usage**: Call `upgrade-nextjs-16` to get automated assistance in migrating components and configuration.
   - **Usage**: Use for setting up new features like Cache Components.

4. **`next-docs`**: Provides access to official Next.js 16 documentation.
   - **Requirement**: Use this as the first source of truth for Next.js 16 patterns.

5. **`shadcn`**: Direct integration with shadcn/ui registry.
   - **Usage**: Call `add_component` to install new UI components.
   - **Usage**: Call `search_components` to find available components in the registry.

6. **`firecrawl`**: Web scraping and documentation retrieval.
   - **Usage**: Use to scrape external documentation for libraries not covered by local docs.
   - **Requirement**: Requires `FIRECRAWL_API_KEY` in environment.

7. **`github`**: Repository and project management.
   - **Usage**: Manage issues, pull requests, and repository metadata.
   - **Requirement**: Requires `GITHUB_PERSONAL_ACCESS_TOKEN` with repo scopes.

## Development Guidelines

- **Always verify runtime state**: If a build fails or behavior is unexpected, use `next-devtools` to inspect logs and errors before making changes.
- **Reference bundled docs**: Use `next-docs` to ensure compliance with Next.js 16 standards.
- **Database Changes**: Use `drizzle-mcp` to verify the schema before generating migrations.
- **Middleware**: Use `src/proxy.ts` (Proxy convention) instead of `middleware.ts`.
- **Dynamic Routes**: Always await `params` in dynamic route handlers.
