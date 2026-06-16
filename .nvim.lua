---@diagnostic disable: redefined-local
vim.lsp.enable({ "svelte", "tsgo" })

local ok, conform = pcall(require, "conform")
if ok then
	local formats = {
		css = { "oxfmt" },
		html = { "oxfmt" },
		javascript = { "oxfmt" },
		javascriptreact = { "oxfmt" },
		json = { "oxfmt" },
		jsonc = { "oxfmt" },
		scss = { "oxfmt" },
		typescript = { "oxfmt" },
		typescriptreact = { "oxfmt" },
		yaml = { "oxfmt" },
	}
	conform.formatters_by_ft = vim.tbl_extend("error", conform.formatters_by_ft, formats)
end
