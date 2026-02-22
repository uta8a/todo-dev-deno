# Release Guide

このリポジトリのリリースは手動で行います。

## 前提

- `main` にリリース対象の変更がマージ済みであること
- `deno.json` の `version` がリリースしたいバージョンと一致していること
  - 例: `version: "0.1.2"` ならタグは `v0.1.2`

## 手順

1. `Release from main` ワークフローを実行する

- GitHub Actions で `Release from main` を開く
- `Run workflow` から `version` に `X.Y.Z` を入力して実行
  - 例: `0.1.2`

このワークフローが行うこと:

- `main` の最新コミットをチェックアウト
- `vX.Y.Z` タグを作成して push
- GitHub Release (`vX.Y.Z`) を作成

2. `Publish` ワークフローを実行する

- GitHub Actions で `Publish` を開く
- `Run workflow` から `ref` に作成したタグを指定して実行
  - 例: `v0.1.2`

`ref` を空で実行した場合は、実行時の `github.ref` を使用します。

## 注意点

- `Publish` はタグ push で自動起動しません（手動実行のみ）
- 同名タグが既に存在する場合、`Release from main` は失敗します
- JSR publish 権限がない場合、`Publish` は失敗します
