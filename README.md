# next-infra

同一の Next.js アプリ (`app/`) を複数の AWS デプロイ構成で動かして比較する素振りリポジトリ。

| 構成 | 関わるファイル |
| --- | --- |
| fargate | `infra/fargate/`, `app/Dockerfile` |
| opennext-tf | `infra/opennext-tf/`, `app/open-next.config.ts` |
| sst | `sst.config.ts`, `app/open-next.config.ts` |
| lwa | `infra/lwa/`, `app/Dockerfile` |
