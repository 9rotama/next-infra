// OpenNext のデフォルト構成。
// server / image-optimization / revalidation を個別 Lambda に分割し、
// アセットと ISR キャッシュは S3、タグキャッシュは DynamoDB、再生成は SQS。
// infra/opennext-tf と sst の両方がこの設定からのビルド成果物を消費する。
// server は streaming ラッパーにして Next.js の streaming SSR を維持する
// (Lambda Function URL 側は RESPONSE_STREAM と対で設定すること)。
const config = {
  default: {
    override: {
      wrapper: 'aws-lambda-streaming',
    },
  },
}

export default config
