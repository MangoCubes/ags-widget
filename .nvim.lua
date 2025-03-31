vim.api.nvim_create_user_command('RunAGS', function()
	vim.cmd('silent !ags run -d ~/Sync/NixConfig/desktop/packages/home/ags &')
end, {})

vim.api.nvim_create_user_command('RunAGSAttached', function()
	vim.cmd('silent !kitty sh -c "ags run -d ~/Sync/NixConfig/desktop/packages/home/ags" &')
end, {})

vim.api.nvim_create_user_command('StopAGS', function()
	vim.cmd('silent !killall gjs &')
end, {})

vim.api.nvim_create_user_command('ShowIcons', function()
	vim.cmd('silent !io.elementary.iconbrowser &')
end, {})

vim.api.nvim_set_keymap('n', '<M-s>', '<cmd>StopAGS<CR><cmd>RunAGS<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<M-S-s>', '<cmd>StopAGS<CR><cmd>RunAGSAttached<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<F5>', '<cmd>RunAGS<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<F6>', '<cmd>StopAGS<CR>', { noremap = true, silent = true })
