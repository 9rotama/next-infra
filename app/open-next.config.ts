// OpenNext のデフォルト構成。
// server / image-optimization / revalidation を個別 Lambda に分割し、
// アセットと ISR キャッシュは S3、タグキャッシュは DynamoDB、再生成は SQS。
// infra/opennext-tf と sst の両方がこの設定からのビルド成果物を消費する。
const config = {
  default: {},
}

export default config
