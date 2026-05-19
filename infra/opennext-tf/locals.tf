locals {
  name_prefix = "${var.project}-${var.stack}"

  # OpenNext (default config) のビルド成果物パス
  server_src       = "${var.open_next_dir}/server-functions/default"
  image_src        = "${var.open_next_dir}/image-optimization-function"
  revalidation_src = "${var.open_next_dir}/revalidation-function"
  dynamodb_src     = "${var.open_next_dir}/dynamodb-provider"
  assets_dir       = "${var.open_next_dir}/assets"
  cache_dir        = "${var.open_next_dir}/cache"

  # S3 上で ISR/fetch キャッシュを置くプレフィックス (OpenNext 既定)
  cache_key_prefix = "_cache"
}

data "aws_caller_identity" "current" {}
