#!/usr/bin/env node
/**
 * 一键发布到 GitHub Pages
 * 用法：
 *   PowerShell:  $env:GITHUB_TOKEN="ghp_xxx"; node scripts/deploy.mjs
 *   Bash:        GITHUB_TOKEN=ghp_xxx node scripts/deploy.mjs
 *
 * 可选环境变量：
 *   REPO_NAME   仓库名，默认 jujutsu-kaisen
 *   OWNER       仓库所属账号，默认使用 token 对应用户
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.GITHUB_TOKEN;
const repoName = process.env.REPO_NAME || 'jujutsu-kaisen';
const apiBase = 'https://api.github.com';

if (!token) {
  console.error('\n缺少 GITHUB_TOKEN。请先创建 Personal Access Token（classic，勾选 repo）。\n');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'jujutsu-kaisen-deploy'
};

async function api(pathname, method = 'GET', body) {
  const res = await fetch(apiBase + pathname, {
    method,
    headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

function run(args, opts = {}) {
  const res = spawnSync('git', args, {
    cwd: siteDir,
    stdio: 'inherit',
    env: { ...process.env, GIT_SSL_BACKEND: 'openssl' },
    ...opts
  });
  if (res.status !== 0) throw new Error(`git ${args[0]} 失败`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('\n[1/4] 验证 GitHub 身份…');
  const me = await api('/user');
  if (!me.ok) {
    console.error('Token 无效或无法访问 GitHub：', me.status, me.data?.message || '');
    process.exit(1);
  }
  const owner = process.env.OWNER || me.data.login;
  console.log(`      登录为 ${owner}`);

  console.log(`\n[2/4] 创建或检查仓库 ${owner}/${repoName}…`);
  let repo = await api(`/repos/${owner}/${repoName}`);
  if (repo.status === 404) {
    repo = await api('/user/repos', 'POST', {
      name: repoName,
      description: '咒术回战 · 视觉档案 — 一个原创的非官方粉丝站点',
      homepage: `https://${owner.toLowerCase()}.github.io/${repoName}/`,
      private: false,
      has_issues: true,
      has_wiki: false,
      auto_init: false
    });
    if (!repo.ok) {
      console.error('创建仓库失败：', repo.status, repo.data?.message || '');
      process.exit(1);
    }
    console.log(`      已创建 https://github.com/${owner}/${repoName}`);
  } else if (repo.ok) {
    console.log('      仓库已存在，将推送当前内容');
  } else {
    console.error('检查仓库失败：', repo.status, repo.data?.message || '');
    process.exit(1);
  }

  console.log('\n[3/4] 提交并推送代码…');
  if (!fs.existsSync(path.join(siteDir, '.git'))) {
    run(['init', '-b', 'main']);
  }
  run(['add', '-A']);
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: siteDir, encoding: 'utf8' });
  if (status.stdout.trim()) {
    run(['-c', 'user.name=' + (process.env.GIT_AUTHOR_NAME || owner), '-c', 'user.email=' + (process.env.GIT_AUTHOR_EMAIL || `${owner}@users.noreply.github.com`), 'commit', '-m', 'feat: launch Jujutsu Kaisen visual archive']);
  } else {
    console.log('      没有新的改动需要提交');
  }
  const cleanRemote = `https://github.com/${owner}/${repoName}.git`;
  const authRemote = `https://x-access-token:${token}@github.com/${owner}/${repoName}.git`;
  const remotes = spawnSync('git', ['remote'], { cwd: siteDir, encoding: 'utf8' }).stdout.split(/\r?\n/).filter(Boolean);
  if (remotes.includes('origin')) run(['remote', 'set-url', 'origin', authRemote]);
  else run(['remote', 'add', 'origin', authRemote]);
  try {
    let fastForward = true;
    const fetched = spawnSync('git', ['fetch', 'origin', 'main'], { cwd: siteDir, stdio: 'ignore', env: { ...process.env, GIT_SSL_BACKEND: 'openssl' } });
    if (fetched.status === 0) {
      fastForward = spawnSync('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], { cwd: siteDir }).status === 0;
    }
    if (!fastForward && process.env.ALLOW_OVERWRITE !== '1') {
      console.error('\n远端仓库已有无关提交，为避免覆盖已停止。');
      console.error('如确认要覆盖，请设置 ALLOW_OVERWRITE=1 后重试。');
      throw new Error('远端仓库已有无关提交，已停止（未覆盖）');
    }
    run(['push', '-u', 'origin', 'main', ...(fastForward ? [] : ['--force'])]);
  } finally {
    try { run(['remote', 'set-url', 'origin', cleanRemote]); } catch { /* noop */ }
  }

  console.log('\n[4/4] 启用 GitHub Pages…');
  let pages = await api(`/repos/${owner}/${repoName}/pages`, 'POST', { source: { branch: 'main', path: '/' } });
  if (pages.status === 409) {
    pages = await api(`/repos/${owner}/${repoName}/pages`, 'PUT', { source: { branch: 'main', path: '/' } });
  }
  if (!pages.ok && pages.status !== 422) {
    console.warn('      启用 Pages 返回：', pages.status, pages.data?.message || '（可能需要在仓库 Settings → Pages 手动开启）');
  } else {
    console.log('      Pages 已配置');
  }

  const siteUrl = `https://${owner.toLowerCase()}.github.io/${repoName}/`;
  console.log(`\n等待 Pages 构建： ${siteUrl}`);
  for (let i = 0; i < 30; i += 1) {
    await sleep(5000);
    const st = await api(`/repos/${owner}/${repoName}/pages`);
    const state = st.data?.status || 'unknown';
    process.stdout.write(`      ${state}…\r`);
    if (state === 'built') break;
    if (state === 'errored') {
      console.warn('\n      构建失败，请到仓库 Actions / Pages 面板查看日志。');
      break;
    }
  }
  console.log(`\n完成。站点地址： ${siteUrl}\n仓库地址： https://github.com/${owner}/${repoName}\n`);
})().catch((err) => {
  console.error('\n部署失败：', err.message);
  process.exit(1);
});
