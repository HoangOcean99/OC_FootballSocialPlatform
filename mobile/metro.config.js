const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// 1. Theo dõi toàn bộ thư mục trong Monorepo
config.watchFolders = [workspaceRoot];

// 2. Chỉ cho Metro biết cần tìm node_modules ở đâu (cả thư mục dự án và thư mục gốc)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Ngăn chặn Metro tìm kiếm vòng lặp không cần thiết
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
